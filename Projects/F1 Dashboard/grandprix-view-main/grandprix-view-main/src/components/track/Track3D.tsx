import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { drivers, flagEvents, type FlagEvent, replay, FPS } from "@/data/f1Mock";
import { useReplay, getFrameAt } from "@/hooks/useReplay";
import TelemetryRibbon from "./TelemetryRibbon";
import IncidentMarkers from "./IncidentMarkers";
import SpatialMarkers from "./SpatialMarkers";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import sceneGltfData from "@/data/scene.json";

let cachedScene: THREE.Group | null = null;
let loadPromise: Promise<THREE.Group> | null = null;

function loadEmbeddedGLTF(): Promise<THREE.Group> {
  if (cachedScene) return Promise.resolve(cachedScene);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.parse(
      JSON.stringify(sceneGltfData),
      "",
      (gltf) => {
        cachedScene = gltf.scene;
        resolve(gltf.scene);
      },
      (error) => {
        console.error("Failed to parse embedded GLTF:", error);
        reject(error as Error);
      }
    );
  });

  return loadPromise;
}

function activeFlag(lap: number): FlagEvent | null {
  // Red takes priority over yellow on the same lap.
  const red = flagEvents.find((f) => f.type === "red" && lap >= f.fromLap && lap <= f.toLap);
  if (red) return red;
  return flagEvents.find((f) => f.type === "yellow" && lap >= f.fromLap && lap <= f.toLap) ?? null;
}

// Target footprint (world units) the model and curve are normalized to.
const TARGET_SIZE = 28;

// ---------------------------------------------------------------------------
// Centerline extraction
//
// The road is a flat ribbon mesh. Its boundary is a set of edges that appear
// in exactly one triangle. Walking those edges yields two closed loops (inner
// and outer kerb). Pairing nearest points across the two loops gives the
// racing centerline, which we feed into a Catmull-Rom curve for the cars.
// ---------------------------------------------------------------------------

function extractRoadData(scene: THREE.Object3D) {
  scene.updateMatrixWorld(true);
  let road: THREE.Mesh | null = null;
  scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && o.name.toLowerCase().includes("road")) {
      road = o as THREE.Mesh;
    }
  });
  if (!road) return null;
  road.updateWorldMatrix(true, false);
  const geo = road.geometry as THREE.BufferGeometry;
  const posAttr = geo.attributes.position as THREE.BufferAttribute;
  const indexAttr = geo.index;
  if (!indexAttr) return null;

  // Snap vertices to a grid so duplicates collapse.
  const v = new THREE.Vector3();
  const keyToIndex = new Map<string, number>();
  const points: { x: number; z: number }[] = [];
  const remap = new Int32Array(posAttr.count);
  let minY = Infinity, maxY = -Infinity;
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < posAttr.count; i++) {
    v.fromBufferAttribute(posAttr, i).applyMatrix4(road.matrixWorld);
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.z < minZ) minZ = v.z;
    if (v.z > maxZ) maxZ = v.z;
    const k = `${Math.round(v.x * 100)},${Math.round(v.z * 100)}`;
    let idx = keyToIndex.get(k);
    if (idx === undefined) {
      idx = points.length;
      keyToIndex.set(k, idx);
      points.push({ x: v.x, z: v.z });
    }
    remap[i] = idx;
  }
  const meanY = (minY + maxY) / 2;
  const meshCenterX = (minX + maxX) / 2;
  const meshCenterZ = (minZ + maxZ) / 2;
  const meshSpan = Math.max(maxX - minX, maxZ - minZ);

  // Count edge occurrences across all triangles.
  const edgeCount = new Map<string, number>();
  const edgeNeighbors = new Map<number, Set<number>>();
  const idx = indexAttr.array as ArrayLike<number>;
  for (let i = 0; i < idx.length; i += 3) {
    const a = remap[idx[i]];
    const b = remap[idx[i + 1]];
    const c = remap[idx[i + 2]];
    for (const [u, w] of [[a, b], [b, c], [c, a]]) {
      if (u === w) continue;
      const k = u < w ? `${u}_${w}` : `${w}_${u}`;
      edgeCount.set(k, (edgeCount.get(k) ?? 0) + 1);
    }
  }
  for (const [k, count] of edgeCount) {
    if (count !== 1) continue;
    const [u, w] = k.split("_").map(Number);
    if (!edgeNeighbors.has(u)) edgeNeighbors.set(u, new Set());
    if (!edgeNeighbors.has(w)) edgeNeighbors.set(w, new Set());
    edgeNeighbors.get(u)!.add(w);
    edgeNeighbors.get(w)!.add(u);
  }

  // Walk boundary edges into closed loops.
  const visited = new Set<number>();
  const loops: number[][] = [];
  for (const start of edgeNeighbors.keys()) {
    if (visited.has(start)) continue;
    const loop: number[] = [];
    let cur = start;
    let prev = -1;
    while (true) {
      if (visited.has(cur)) break;
      visited.add(cur);
      loop.push(cur);
      const nbrs = edgeNeighbors.get(cur);
      if (!nbrs) break;
      let next = -1;
      for (const n of nbrs) if (n !== prev && !visited.has(n)) { next = n; break; }
      if (next === -1) break;
      prev = cur;
      cur = next;
    }
    if (loop.length > 20) loops.push(loop);
  }
  if (loops.length < 2) return null;

  // Two longest loops = inner and outer track edges.
  loops.sort((a, b) => b.length - a.length);
  const outer = loops[0].map((i) => points[i]);
  const inner = loops[1].map((i) => points[i]);

  // For each outer point, find nearest inner point → midpoint = centerline.
  const center: { x: number; z: number }[] = [];
  for (const p of outer) {
    let best = inner[0];
    let bestD = Infinity;
    for (const q of inner) {
      const d = (p.x - q.x) ** 2 + (p.z - q.z) ** 2;
      if (d < bestD) { bestD = d; best = q; }
    }
    center.push({ x: (p.x + best.x) / 2, z: (p.z + best.z) / 2 });
  }

  // Normalize using the FULL road bounding box so the model is always sized
  // to TARGET_SIZE — even if boundary-loop extraction picks up partial loops.
  const scale = TARGET_SIZE / meshSpan;
  const norm = center.map(
    (p) => new THREE.Vector3((p.x - meshCenterX) * scale, 0, (p.z - meshCenterZ) * scale),
  );

  // Resample to a uniform N points to feed the curve.
  const N = 200;
  const resampled: THREE.Vector3[] = [];
  const step = norm.length / N;
  for (let i = 0; i < N; i++) resampled.push(norm[Math.floor(i * step)]);

  return {
    centerline: resampled,
    modelCenter: new THREE.Vector3(meshCenterX, meanY, meshCenterZ),
    modelScale: scale,
    roadThickness: (maxY - minY) * scale,
    roadMatrix: road.matrixWorld.clone(),
  };
}

// ---------------------------------------------------------------------------

function MonacoModel({
  scene,
  onReady,
}: {
  scene: THREE.Group;
  onReady: (data: { curve: THREE.CatmullRomCurve3; center: THREE.Vector3; scale: number; roadThickness: number; roadMatrix: THREE.Matrix4 }) => void;
}) {
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    const data = extractRoadData(scene);
    if (!data) return;
    const curve = new THREE.CatmullRomCurve3(data.centerline, true, "catmullrom", 0.5);
    onReady({ curve, center: data.modelCenter, scale: data.modelScale, roadThickness: data.roadThickness, roadMatrix: data.roadMatrix });
    // Tint walls F1 red, dim the road slightly, kill specularity.
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = false;
      m.receiveShadow = true;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (m.name.toLowerCase().includes("wall")) {
        mat.color = new THREE.Color("#e8002d");
        mat.emissive = new THREE.Color("#3a0000");
        mat.emissiveIntensity = 0.4;
      } else {
        mat.color = new THREE.Color("#2a2a2a");
        mat.emissive = new THREE.Color("#1a1a1a");
        mat.emissiveIntensity = 0.5;
        mat.roughness = 0.85;
      }
    });
  }, [scene, onReady]);

  return null;
}

function PositionedModel({ scene, center, scale }: { scene: THREE.Group; center: THREE.Vector3; scale: number }) {
  return (
    <group scale={scale} position={[-center.x * scale, -center.y * scale, -center.z * scale]}>
      <primitive object={scene} />
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#050505" roughness={1} />
    </mesh>
  );
}

interface CarProps {
  curve: THREE.CatmullRomCurve3;
  driverId: string;
  color: string;
  number: number;
  isLeader: boolean;
  yOffset: number;
}

function Car({ curve, driverId, color, number, isLeader, yOffset }: CarProps) {
  const ref = useRef<THREE.Group>(null);
  const focused = useReplay((s) => s.focusedDriverId);
  const setFocus = useReplay((s) => s.setFocus);
  const [hovered, setHovered] = useState(false);
  const isFocused = focused === driverId;

  useFrame(() => {
    const t = useReplay.getState().time;
    const frame = getFrameAt(t);
    const car = frame.cars.find((c) => c.driverId === driverId);
    if (!car || car.retired || !ref.current) {
      if (ref.current) ref.current.visible = false;
      return;
    }
    if (ref.current) ref.current.visible = true;

    // Interpolate progress to ensure smooth 60fps movement at 1x real-time speed
    const frameIndex = Math.floor(t * FPS);
    const nextFrameIndex = Math.min(replay.length - 1, frameIndex + 1);
    const nextFrame = replay[nextFrameIndex];
    const nextCar = nextFrame.cars.find((c) => c.driverId === driverId);

    let progress = car.progress;
    if (nextCar) {
      const frameTime = frameIndex / FPS;
      const alpha = Math.min(1, Math.max(0, (t - frameTime) * FPS)); // clamp between 0 and 1
      
      let nextProgress = nextCar.progress;
      if (nextCar.lap > car.lap || nextProgress < progress) {
        nextProgress += 1.0; // handle lap wrap-around
      }
      
      progress = progress + (nextProgress - progress) * alpha;
      if (progress > 1.0) progress -= 1.0;
    }

    const p = curve.getPointAt(progress);
    ref.current.position.set(p.x, yOffset, p.z);
  });

  const r = isFocused ? 0.32 : isLeader ? 0.28 : 0.24;

  return (
    <group
      ref={ref}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      onClick={(e) => { e.stopPropagation(); setFocus(driverId); }}
    >
      <mesh>
        <sphereGeometry args={[r, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isFocused ? 1.2 : isLeader ? 0.9 : 0.6}
          roughness={0.4}
        />
      </mesh>
      {(hovered || isFocused) && (
        <Html position={[0, 0.6, 0]} center distanceFactor={10}>
          <div className="px-2 py-1 bg-card border border-primary text-[10px] font-bold tracking-widest whitespace-nowrap mono text-foreground">
            #{number} · {driverId.toUpperCase()}
          </div>
        </Html>
      )}
    </group>
  );
}

function Cars({ curve, yOffset }: { curve: THREE.CatmullRomCurve3; yOffset: number }) {
  const [leaderId, setLeaderId] = useState(drivers[0].id);
  useFrame(() => {
    const frame = getFrameAt(useReplay.getState().time);
    const leader = frame.cars.find((c) => c.position === 1);
    if (leader && leader.driverId !== leaderId) setLeaderId(leader.driverId);
  });
  return (
    <>
      {drivers.map((d) => (
        <Car key={d.id} curve={curve} driverId={d.id} color={d.color} number={d.number} isLeader={d.id === leaderId} yOffset={yOffset} />
      ))}
    </>
  );
}

function Ticker() {
  useFrame((_, dt) => { useReplay.getState().tick(dt); });
  return null;
}

// Pulsing lights + tinted ring under the track when a flag is active.
function FlagFX({ flag }: { flag: FlagEvent | null }) {
  const lightA = useRef<THREE.PointLight>(null);
  const lightB = useRef<THREE.PointLight>(null);
  const lightC = useRef<THREE.PointLight>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!flag) return;
    const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 1.25);
    const intensity = 1.5 + pulse * 4;
    if (lightA.current) lightA.current.intensity = intensity;
    if (lightB.current) lightB.current.intensity = intensity * 0.8;
    if (lightC.current) lightC.current.intensity = intensity * 0.8;
    if (ring.current) {
      const mat = ring.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + pulse * 0.45;
    }
  });
  if (!flag) return null;
  const color = flag.type === "red" ? "#e8002d" : "#FFD400";
  return (
    <>
      <pointLight ref={lightA} position={[0, 12, 0]} color={color} intensity={3} distance={60} decay={1.5} />
      <pointLight ref={lightB} position={[14, 6, -14]} color={color} intensity={2} distance={50} decay={1.5} />
      <pointLight ref={lightC} position={[-14, 6, 14]} color={color} intensity={2} distance={50} decay={1.5} />
      {flag.type !== "red" && (
        <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.95, 0]}>
          <ringGeometry args={[18, 26, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
    </>
  );
}

type CamMode = "orbit" | "top" | "trackside" | "chase";

function CameraRig({ mode, curve, trackData }: { mode: CamMode; curve: THREE.CatmullRomCurve3 | null; trackData: { center: THREE.Vector3; scale: number; roadThickness: number; roadMatrix: THREE.Matrix4 } | null }) {
  const { camera } = useThree();
  const focused = useReplay((s) => s.focusedDriverId);
  const viewMode = useReplay((s) => s.viewMode);
  const selectedIncident = useReplay((s) => s.selectedIncident);
  const selectedDriver = useReplay((s) => s.selectedDriver);
  const comparisonDriver = useReplay((s) => s.comparisonDriver);

  useEffect(() => {
    if (viewMode === "incidents" && selectedIncident && trackData) {
      const { center, scale, roadThickness, roadMatrix } = trackData;
      
      const v = new THREE.Vector3(selectedIncident.x, selectedIncident.z, 0).applyMatrix4(roadMatrix);
      const x = (v.x - center.x) * scale;
      const z = (v.z - center.z) * scale;
      const y = roadThickness / 2 + 0.05;

      camera.position.set(x + 5, y + 6, z + 8);
      camera.lookAt(x, y, z);
    } else if (mode === "top") {
      camera.position.set(0.01, 34, 0); // Rotate 90 degrees (align Z-axis horizontally) and zoom out slightly
      camera.lookAt(0, 0, 0);
    } else if (mode === "trackside") {
      camera.position.set(18, 6, 18);
      camera.lookAt(0, 0, 0);
    } else if (mode === "orbit") {
      camera.position.set(20, 18, 22);
      camera.lookAt(0, 0, 0);
    }
  }, [mode, camera, viewMode, selectedIncident, trackData]);

  useFrame(() => {
    if (mode !== "chase" || !curve || viewMode !== "replay") return;
    const t = useReplay.getState().time;
    const frameIndex = Math.floor(t * FPS);
    const frame = replay[frameIndex] || getFrameAt(t);
    const car = frame.cars.find((c) => c.driverId === focused);
    if (!car) return;

    // Interpolate progress to match the smooth 60fps car rendering
    const nextFrameIndex = Math.min(replay.length - 1, frameIndex + 1);
    const nextFrame = replay[nextFrameIndex];
    const nextCar = nextFrame.cars.find((c) => c.driverId === focused);

    let progress = car.progress;
    if (nextCar) {
      const frameTime = frameIndex / FPS;
      const alpha = Math.min(1, Math.max(0, (t - frameTime) * FPS));
      
      let nextProgress = nextCar.progress;
      if (nextCar.lap > car.lap || nextProgress < progress) {
        nextProgress += 1.0;
      }
      
      progress = progress + (nextProgress - progress) * alpha;
      if (progress > 1.0) progress -= 1.0;
    }

    const p = curve.getPointAt(progress);
    const tan = curve.getTangentAt(progress);
    const back = p.clone().sub(tan.clone().multiplyScalar(5.5)); // Zoom out from 2.5 to 5.5
    back.y = 2.4; // Raise camera height from 1.4 to 2.4
    camera.position.lerp(back, 0.1);
    camera.lookAt(p.x, 0.4, p.z);
  });
  return null;
}

export default function Track3D() {
  const [trackData, setTrackData] = useState<{
    curve: THREE.CatmullRomCurve3;
    center: THREE.Vector3;
    scale: number;
    roadThickness: number;
    roadMatrix: THREE.Matrix4;
  } | null>(null);
  const [mode, setMode] = useState<CamMode>("orbit");
  const [currentLap, setCurrentLap] = useState(1);
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    loadEmbeddedGLTF()
      .then(setScene)
      .catch(setLoadError);
  }, []);

  // Sample the leader's lap ~5x/sec so the HUD + FX react to flag windows.
  useEffect(() => {
    const id = setInterval(() => {
      const t = useReplay.getState().time;
      const leader = getFrameAt(t).cars.find((c) => c.position === 1);
      if (leader) setCurrentLap(leader.lap);
    }, 200);
    return () => clearInterval(id);
  }, []);

  const viewMode = useReplay((s) => s.viewMode);
  const selectedDriver = useReplay((s) => s.selectedDriver);
  const comparisonDriver = useReplay((s) => s.comparisonDriver);
  const flag = activeFlag(currentLap);

  if (loadError) {
    throw loadError;
  }

  if (!scene) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-[#0c0c0f] border border-white/5 no-drag select-none">
        <div className="text-primary text-[10px] font-bold tracking-[2px] uppercase mb-1.5 animate-pulse">Initializing 3D Track...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full no-drag">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [20, 18, 22], fov: 45 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 50, 120]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[15, 25, 10]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <pointLight position={[-15, 8, -15]} intensity={0.6} color="#e8002d" />
        <Ground />
        <MonacoModel scene={scene} onReady={setTrackData} />
        {trackData && (
          <>
            <PositionedModel scene={scene} center={trackData.center} scale={trackData.scale} />
            {viewMode === "replay" && (
              <Cars curve={trackData.curve} yOffset={trackData.roadThickness / 2 + 0.25} />
            )}
            {viewMode === "spatial" && (
              <SpatialMarkers curve={trackData.curve} yOffset={trackData.roadThickness / 2 + 0.25} />
            )}
            <group scale={trackData.scale} position={[-trackData.center.x * trackData.scale, -trackData.center.y * trackData.scale, -trackData.center.z * trackData.scale]}>
              {(viewMode === "telemetry" || viewMode === "comparison") && (
                <TelemetryRibbon
                  yOffset={(trackData.roadThickness / 2 + 0.05) / trackData.scale}
                  roadMatrix={trackData.roadMatrix}
                  scale={trackData.scale} // Still pass scale for width sizing
                />
              )}
              {viewMode === "incidents" && (
                <IncidentMarkers
                  yOffset={(trackData.roadThickness / 2 + 0.05) / trackData.scale}
                  roadMatrix={trackData.roadMatrix}
                  scale={trackData.scale}
                />
              )}
            </group>
          </>
        )}
        <Ticker />
        <FlagFX flag={flag} />
        <CameraRig mode={mode} curve={trackData?.curve ?? null} trackData={trackData} />
        {mode === "orbit" && <OrbitControls enablePan={false} minDistance={8} maxDistance={60} maxPolarAngle={Math.PI / 2.05} />}
      </Canvas>

      <div className="absolute bottom-3 right-3 flex gap-1 z-10">
        {(["orbit", "top", "trackside", "chase"] as CamMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-2.5 py-1 text-[10px] tracking-widest uppercase border transition-colors mono ${
              mode === m
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card/70 text-muted-foreground border-border hover:text-foreground hover:border-primary/60"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {flag && (
        <div
          className="absolute bottom-8 left-3 text-left bg-[#0c0c0f]/90 border border-[#e8002d]/30 backdrop-blur-md px-3 py-1.5 rounded-md shadow-2xl z-10 select-none no-drag"
          style={{
            minWidth: "220px",
          }}
        >
          <div 
            className="mono text-[10px] font-bold tracking-widest uppercase flex items-center justify-start gap-1.5"
            style={{ color: flag.type === "red" ? "#e8002d" : "#FFD400" }}
          >
            <span className="animate-pulse">{flag.type === "red" ? "🔴 RED FLAG" : "🟡 YELLOW FLAG"}</span>
            <span className="text-white/40">·</span>
            <span className="text-white">LAP {currentLap}</span>
          </div>
          <div className="text-[9px] font-medium text-white/70 normal-case tracking-normal mt-0.5 leading-relaxed">
            {flag.note}
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 text-[9px] text-muted-foreground/60 tracking-wider">
        Track model: Monaco GP by kartiknaaditya · CC-BY-4.0
      </div>

      {viewMode === "telemetry" && (
        <div className="absolute bottom-10 left-3.5 bg-[#1E1E2A] border border-[#33334a] px-3 py-2 rounded-[3px] z-10">
          <div className="font-['Barlow_Condensed',sans-serif] font-bold text-[9px] tracking-[2px] text-white/60 uppercase mb-1.5">
            Speed km/h
          </div>
          <div
            className="h-1.5 w-[140px] mb-1 rounded-[1px]"
            style={{ background: "linear-gradient(to right,#0057FF,#00CFFF,#00E676,#FFD600,#FF6D00,#FF1E00)" }}
          />
          <div className="flex justify-between text-[9px] text-white/60 font-['DM_Mono',monospace]">
            <span>0</span>
            <span>150</span>
            <span>300+</span>
          </div>
        </div>
      )}

      {viewMode === "comparison" && comparisonDriver && (
        <div className="absolute bottom-10 left-3.5 bg-[#1E1E2Aee] border border-[#33334a] px-4 py-3 rounded z-10 min-w-[180px]">
          <div className="font-['Barlow_Condensed',sans-serif] font-extrabold text-[11px] tracking-[2px] text-white uppercase mb-3">
            Track Dominance
          </div>
          {[
            { color: "#e8002d", label: selectedDriver },
            { color: "#00c3ff", label: comparisonDriver },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2.5 mb-1.5 last:mb-0">
              <div className="w-7 h-2 rounded-sm shrink-0" style={{ background: color }} />
              <span className="font-['Barlow_Condensed',sans-serif] text-[13px] font-bold text-white uppercase tracking-wider">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
