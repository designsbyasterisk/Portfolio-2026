import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { useReplay } from "@/hooks/useReplay";
import { telemetryMap } from "@/data/telemetryData";

interface TelemetryPoint {
  lng: number;
  lat: number;
  speed: number;
}

interface TelemetryData {
  driver: string;
  lapTime: string;
  lapData: TelemetryPoint[];
}

interface TelemetryRibbonProps {
  scale: number;
  yOffset: number;
  roadMatrix: THREE.Matrix4;
}

const SPEED_RAMP = [0x0057FF, 0x00CFFF, 0x00E676, 0xFFD600, 0xFF6D00, 0xFF1E00];

function speedColor(speed: number, minS: number, maxS: number) {
  const t = Math.max(0, Math.min(1, (speed - minS) / (maxS - minS || 1)));
  const fi = t * (SPEED_RAMP.length - 1);
  const lo = Math.floor(fi);
  const hi = Math.min(lo + 1, SPEED_RAMP.length - 1);
  const f = fi - lo;
  const a = new THREE.Color(SPEED_RAMP[lo]);
  const b = new THREE.Color(SPEED_RAMP[hi]);
  return new THREE.Color(
    a.r + (b.r - a.r) * f,
    a.g + (b.g - a.g) * f,
    a.b + (b.b - a.b) * f
  );
}

export default function TelemetryRibbon({ scale, yOffset, roadMatrix }: TelemetryRibbonProps) {
  const viewMode = useReplay((s) => s.viewMode);
  const telemetryOpacity = useReplay((s) => s.telemetryOpacity);
  const selectedDriver = useReplay((s) => s.selectedDriver);
  const comparisonDriver = useReplay((s) => s.comparisonDriver);
  const activeRace = useReplay((s) => s.activeRace);

  const primaryData = useMemo(() => {
    if (viewMode !== "telemetry" && viewMode !== "comparison") return null;
    const driverName = selectedDriver.toLowerCase();
    return (telemetryMap[driverName] as TelemetryData) || null;
  }, [selectedDriver, viewMode]);

  const compareData = useMemo(() => {
    if (viewMode !== "comparison" || !comparisonDriver) return null;
    const driverName = comparisonDriver.toLowerCase();
    return (telemetryMap[driverName] as TelemetryData) || null;
  }, [comparisonDriver, viewMode]);

  const geometry = useMemo(() => {
    if (!primaryData || !primaryData.lapData || primaryData.lapData.length < 2) return null;

    const lapData = primaryData.lapData;
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const halfWidth = 0.4 / scale; // Dynamic width based on the scale of the track

    // Map all center points first
    const centerPoints = lapData.map((p) => {
      // Claude used lng for X and lat for Y
      return new THREE.Vector3(p.lng, p.lat, 0).applyMatrix4(roadMatrix);
    });

    // Speed min/max for coloring
    const speeds = lapData.map((p) => p.speed);
    const minS = Math.min(...speeds);
    const maxS = Math.max(...speeds);

    // Dominance color determination logic
    const smoothSpeed = (data: TelemetryPoint[], i: number) => {
      let sum = 0, cnt = 0;
      for (let k = Math.max(0, i - 5); k <= Math.min(data.length - 1, i + 5); k++) {
        sum += data[k].speed;
        cnt++;
      }
      return sum / cnt;
    };

    lapData.forEach((p, i) => {
      const curr = centerPoints[i];
      const next = centerPoints[Math.min(i + 1, centerPoints.length - 1)];
      const prev = centerPoints[Math.max(i - 1, 0)];
      
      const dx = next.x - prev.x;
      const dz = next.z - prev.z;
      const len = Math.sqrt(dx * dx + dz * dz) || 1;
      const px = -dz / len;
      const pz = dx / len;

      // Add offsets in GLTF World space
      const p1x = curr.x + px * halfWidth;
      const p1z = curr.z + pz * halfWidth;
      const p2x = curr.x - px * halfWidth;
      const p2z = curr.z - pz * halfWidth;

      // Now we have the points in GLTF world space.
      // We set their Y to the desired local yOffset so it hovers above the road
      positions.push(
        p1x,
        yOffset,
        p1z,
        p2x,
        yOffset,
        p2z
      );

      // Colors
      let col = new THREE.Color(0xffffff);
      if (viewMode === "telemetry") {
        col = speedColor(p.speed, minS, maxS);
      } else if (viewMode === "comparison" && compareData?.lapData) {
        const s1 = smoothSpeed(lapData, i);
        // Map current index progress to comparison dataset length
        const compIndex = Math.round((i * (compareData.lapData.length - 1)) / (lapData.length - 1));
        const s2 = smoothSpeed(compareData.lapData, compIndex);
        const diff = s1 - s2;
        
        if (diff >= 0) {
          col = new THREE.Color(0xe8002d); // Selected driver faster (Ferrari vivid red)
        } else {
          col = new THREE.Color(0x00c3ff); // Comparison driver faster (vivid cyan/blue)
        }
      }
      
      colors.push(col.r, col.g, col.b, col.r, col.g, col.b);

      if (i < lapData.length - 1) {
        const b = i * 2;
        indices.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
      }
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    return geo;
  }, [primaryData, compareData, scale, yOffset, viewMode, roadMatrix]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} renderOrder={999}>
      <meshBasicMaterial
        vertexColors
        side={THREE.DoubleSide}
        transparent
        opacity={telemetryOpacity / 100}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
