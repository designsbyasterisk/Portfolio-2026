import { useEffect, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useReplay } from "@/hooks/useReplay";
import monacoRaceData from "@/data/monaco_race.json";

interface Incident {
  lap: number;
  drivers: string[];
  type: string;
  turn: string;
  description: string;
  raceImpact: string;
  severity: string;
  x: number;
  z: number;
}

interface IncidentMarkersProps {
  scale: number;
  yOffset: number;
  roadMatrix: THREE.Matrix4;
}

const TYPE_COLORS: Record<string, string> = {
  crash: "#FF1E00",
  collision: "#FF6D00",
  safety_car: "#FFD600",
  overtake: "#00E676",
  mechanical: "#9C27B0",
  fastest_lap: "#00E5FF",
};

export default function IncidentMarkers({ scale, yOffset, roadMatrix }: IncidentMarkersProps) {
  const activeRace = useReplay((s) => s.activeRace);
  const selectedIncident = useReplay((s) => s.selectedIncident);
  const setSelectedIncident = useReplay((s) => s.setSelectedIncident);
  const incidents = (monacoRaceData.incidents || []) as Incident[];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <>
      {incidents.map((inc, i) => {
        // Map Claude's local XY plane onto the track's GLTF space by applying the track's matrix
        const v = new THREE.Vector3(inc.x, inc.z, 0).applyMatrix4(roadMatrix);
        
        const xPos = v.x;
        const zPos = v.z;
        const color = TYPE_COLORS[inc.type] || "#FF1E00";
        const isSelected = selectedIncident && selectedIncident.turn === inc.turn;
        const isHovered = hoveredIndex === i;
        
        // Base size in world units
        const markerScale = isSelected ? 2.2 : isHovered ? 1.6 : 1.2;

        return (
          <group key={i} position={[xPos, yOffset + 0.3 / scale, zPos]}>
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredIndex(i);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                setHoveredIndex(null);
                document.body.style.cursor = "default";
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIncident(inc);
              }}
            >
              <sphereGeometry args={[(0.6 * markerScale) / scale, 16, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={isSelected ? 1.0 : isHovered ? 0.9 : 0.7}
                depthTest={false}
              />
            </mesh>

            {/* Glowing outer ring for selected incident */}
            {isSelected && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2 / scale, 0]}>
                <ringGeometry args={[1.2 / scale, 1.8 / scale, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>
            )}

            {/* Tooltip on Hover */}
            {(isHovered || isSelected) && (
              <Html position={[0, 0.8, 0]} center distanceFactor={12}>
                <div className="px-2 py-1 bg-card/95 border border-border text-[9px] font-bold tracking-wider uppercase text-foreground shadow-lg backdrop-blur-sm whitespace-nowrap">
                  {inc.type.replace("_", " ")} · {inc.turn}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}
