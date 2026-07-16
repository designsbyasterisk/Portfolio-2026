import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useReplay } from "@/hooks/useReplay";

const MARKERS = [
  // SECTORS
  { id: "s1", label: "SECTOR 1", start: 0.0, end: 0.33, type: "sector" },
  { id: "s2", label: "SECTOR 2", start: 0.33, end: 0.66, type: "sector" },
  { id: "s3", label: "SECTOR 3", start: 0.66, end: 0.999, type: "sector" },
  
  // ZONES & INFO
  { id: "pit_entry", label: "PIT ENTRY", start: 0.95, end: 0.98, type: "info" },
  { id: "pit_exit", label: "PIT EXIT", start: 0.02, end: 0.05, type: "info" },
  { id: "tunnel", label: "TUNNEL", start: 0.49, end: 0.58, type: "info" },
  { id: "drs_1", label: "DRS ZONE", start: 0.85, end: 0.98, type: "drs" },

  // TURNS
  { id: "t1", label: "T1 (Sainte Devote)", start: 0.0, end: 0.02, type: "turn" },
  { id: "t6", label: "T6 (Fairmont Hairpin)", start: 0.33, end: 0.37, type: "turn" },
  { id: "t13", label: "T13-14 (Swimming Pool)", start: 0.72, end: 0.76, type: "turn" }
];

interface SpatialMarkersProps {
  curve: THREE.CatmullRomCurve3;
  yOffset: number;
}

function Marker({ m, curve, yOffset }: { m: typeof MARKERS[0], curve: THREE.CatmullRomCurve3, yOffset: number }) {
  const selectedZone = useReplay((s) => s.selectedZone);
  const setSelectedZone = useReplay((s) => s.setSelectedZone);
  const selected = selectedZone === m.id;

  const geometry = useMemo(() => {
    const points = [];
    let len = m.end - m.start;
    if (len < 0) len += 1.0;
    
    // Sample density based on length
    const numPoints = Math.max(10, Math.floor(len * 250)); 
    for(let i=0; i<=numPoints; i++) {
       let t = m.start + len * (i / numPoints);
       if (t > 1.0) t -= 1.0;
       points.push(curve.getPointAt(t));
    }

    const positions: number[] = [];
    const indices: number[] = [];
    const halfWidth = 0.6; // approx half of track width

    for(let i=0; i<points.length; i++) {
      const curr = points[i];
      const next = points[Math.min(i+1, points.length-1)];
      const prev = points[Math.max(i-1, 0)];
      
      const dx = next.x - prev.x;
      const dz = next.z - prev.z;
      const dLen = Math.sqrt(dx*dx + dz*dz) || 1;
      const px = -dz / dLen;
      const pz = dx / dLen;
      
      // Calculate local Y offset to avoid z-fighting. Sectors go below other markers.
      const localY = yOffset + (m.type === "sector" ? 0.01 : 0.02);
      
      positions.push(
        curr.x + px * halfWidth, localY, curr.z + pz * halfWidth,
        curr.x - px * halfWidth, localY, curr.z - pz * halfWidth
      );
      
      if (i < points.length - 1) {
         const b = i * 2;
         indices.push(b, b+1, b+2, b+1, b+3, b+2);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    return geo;
  }, [m, curve, yOffset]);

  // Determine midpoint for label
  let mid = m.start + (m.end - m.start) / 2;
  if (m.end < m.start) {
     mid = m.start + (m.end + 1.0 - m.start) / 2;
     if (mid > 1.0) mid -= 1.0;
  }
  const midPoint = curve.getPointAt(mid);

  let color = "#1E40AF"; // default blue
  let bg = "rgba(30, 64, 175, 0.2)";
  let opacity = 0.4;

  if (m.type === "drs") {
    color = "#10B981"; // green
    bg = "rgba(16, 185, 129, 0.2)";
  } else if (m.type === "turn") {
    color = "#F97316"; // orange
    bg = "rgba(249, 115, 22, 0.2)";
  } else if (m.type === "sector") {
    if (m.id === "s1") { color = "#FACC15"; bg = "rgba(250, 204, 21, 0.1)"; } // Yellow
    if (m.id === "s2") { color = "#A855F7"; bg = "rgba(168, 85, 247, 0.1)"; } // Purple
    if (m.id === "s3") { color = "#EF4444"; bg = "rgba(239, 68, 68, 0.1)"; }  // Red
    opacity = 0.15; // Very subtle for full sectors
  }

  if (selected) {
    opacity = m.type === "sector" ? 0.45 : 0.85;
  }

  return (
    <group>
      <mesh 
        geometry={geometry}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedZone(selected ? null : m.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "default";
        }}
      >
        <meshBasicMaterial color={color} opacity={opacity} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[midPoint.x, yOffset + 0.6, midPoint.z]} center distanceFactor={15}>
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedZone(selected ? null : m.id);
          }}
          className={`px-2 py-1 border text-[9px] font-bold tracking-widest whitespace-nowrap mono backdrop-blur-sm transition-all duration-200 cursor-pointer select-none ${
            selected ? 'scale-110 border-white font-extrabold' : 'hover:scale-105'
          } ${m.type === 'sector' ? 'opacity-80' : ''}`}
          style={{ 
            color: selected ? '#ffffff' : color, 
            borderColor: selected ? '#ffffff' : color, 
            backgroundColor: selected ? color : bg,
            boxShadow: selected ? `0 0 15px ${color}` : undefined 
          }}
        >
          {m.label}
        </div>
      </Html>
    </group>
  );
}

export default function SpatialMarkers({ curve, yOffset }: SpatialMarkersProps) {
  return (
    <>
      {MARKERS.map(m => (
        <Marker key={m.id} m={m} curve={curve} yOffset={yOffset} />
      ))}
    </>
  );
}
