import { PersonnelIcon, StretcherIcon, SOSIcon } from "./Icons";
import { useTheme } from "./ThemeContext";

interface MapUnit {
  id: string;
  x: number;
  y: number;
  type: "personnel" | "stretcher" | "sos";
  status: "moving" | "stationary" | "sos";
  trail: Array<{ x: number; y: number }>;
}

const mapUnits: MapUnit[] = [
  {
    id: "U-01",
    x: 22,
    y: 35,
    type: "personnel",
    status: "moving",
    trail: [
      { x: 14, y: 42 },
      { x: 17, y: 40 },
      { x: 19, y: 38 },
      { x: 21, y: 36 },
      { x: 22, y: 35 },
    ],
  },
  {
    id: "U-02",
    x: 58,
    y: 55,
    type: "stretcher",
    status: "stationary",
    trail: [
      { x: 65, y: 48 },
      { x: 63, y: 50 },
      { x: 61, y: 52 },
      { x: 59, y: 54 },
      { x: 58, y: 55 },
    ],
  },
  {
    id: "U-03",
    x: 75,
    y: 28,
    type: "sos",
    status: "sos",
    trail: [
      { x: 70, y: 22 },
      { x: 72, y: 24 },
      { x: 73, y: 26 },
      { x: 74, y: 27 },
      { x: 75, y: 28 },
    ],
  },
  {
    id: "U-04",
    x: 40,
    y: 70,
    type: "personnel",
    status: "moving",
    trail: [
      { x: 32, y: 65 },
      { x: 35, y: 67 },
      { x: 37, y: 68 },
      { x: 39, y: 69 },
      { x: 40, y: 70 },
    ],
  },
];

const topoLines = [
  "M 0 80 Q 25 75 50 82 Q 75 88 100 78",
  "M 0 60 Q 20 55 45 62 Q 70 68 100 58",
  "M 0 40 Q 30 35 55 42 Q 80 48 100 38",
  "M 0 20 Q 35 15 60 22 Q 85 28 100 18",
  "M 10 100 Q 30 92 55 98 Q 78 104 100 95",
  "M 5 5 Q 25 0 50 8 Q 72 14 100 5",
];

export function MapLayer() {
  const { theme } = useTheme();

  return (
    <section id="map" className="mb-16">
      <div className="mb-6">
        <span
          className="text-xs tracking-widest uppercase mb-2 block"
          style={{ color: theme.sos, fontFamily: "'JetBrains Mono', monospace" }}
        >
          03 — UI Components
        </span>
        <h2
          className="mb-2"
          style={{ color: theme.textPrimary, fontSize: "32px", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
        >
          The Map Layer
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: "16px", fontFamily: "'Inter', sans-serif" }}>
          {theme.mode === "dark"
            ? "Dark topographic base — low saturation so Orange/Green icons pop. Breadcrumb trails show unit paths."
            : "Light topographic base — clean terrain view for daytime field operations. Orange/Green icons maintain high contrast."}
        </p>
      </div>

      <div
        style={{
          backgroundColor: theme.mapBg,
          borderRadius: "8px",
          border: `2px solid ${theme.border}`,
          overflow: "hidden",
          position: "relative",
          height: "380px",
          boxShadow: theme.cardShadow,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          {/* Grid lines */}
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
            <line key={`v-${v}`} x1={v} y1="0" x2={v} y2="100" stroke={theme.mapGrid} strokeWidth="0.3" />
          ))}
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
            <line key={`h-${v}`} x1="0" y1={v} x2="100" y2={v} stroke={theme.mapGrid} strokeWidth="0.3" />
          ))}

          {/* Topo contour lines */}
          {topoLines.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={theme.mapTopo} strokeWidth="0.6" opacity="0.7" />
          ))}

          {/* Breadcrumb trails */}
          {mapUnits.map((unit) => {
            const color =
              unit.status === "sos" ? theme.sos : unit.status === "moving" ? theme.green : theme.grey;
            const points = unit.trail.map((p) => `${p.x},${p.y}`).join(" ");
            return (
              <polyline
                key={`trail-${unit.id}`}
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="0.5"
                strokeDasharray="1.5 1"
                opacity="0.6"
              />
            );
          })}

          {/* Unit markers */}
          {mapUnits.map((unit) => {
            const color =
              unit.status === "sos" ? theme.sos : unit.status === "moving" ? theme.green : theme.grey;
            return (
              <g key={unit.id}>
                <circle
                  cx={unit.x}
                  cy={unit.y}
                  r="4"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.5"
                  opacity="0.4"
                  style={{
                    animation:
                      unit.status === "sos"
                        ? "mapSosPulse 0.5s ease-in-out infinite alternate"
                        : unit.status === "moving"
                        ? "mapBreathe 4s ease-in-out infinite"
                        : "none",
                  }}
                />
                <circle cx={unit.x} cy={unit.y} r="1.8" fill={color} />
                <text
                  x={unit.x + 2.5}
                  y={unit.y - 2.5}
                  fill={color}
                  fontSize="2.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {unit.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Map legend */}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            backgroundColor: theme.mapOverlay,
            borderRadius: "6px",
            border: `1px solid ${theme.border}`,
            padding: "10px 14px",
            display: "flex",
            gap: "16px",
          }}
        >
          {[
            { color: theme.green, label: "Moving", Icon: PersonnelIcon },
            { color: theme.grey, label: "Static", Icon: StretcherIcon },
            { color: theme.sos, label: "SOS", Icon: SOSIcon },
          ].map(({ color, label, Icon }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={14} color={color} />
              <span
                style={{
                  color: theme.textSecondary,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                }}
              >
                {label}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <svg width="20" height="4" viewBox="0 0 20 4">
              <line
                x1="0"
                y1="2"
                x2="20"
                y2="2"
                stroke={theme.green}
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
            </svg>
            <span
              style={{
                color: theme.textSecondary,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
              }}
            >
              Breadcrumb
            </span>
          </div>
        </div>

        {/* Top right: sector label */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            backgroundColor: theme.mapOverlay,
            border: `1px solid ${theme.border}`,
            borderRadius: "4px",
            padding: "6px 10px",
          }}
        >
          <span
            style={{
              color: theme.textSecondary,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
            }}
          >
            OP KERALA RESCUE — SECTOR 4
          </span>
        </div>

        {/* Top left: mission stats */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            backgroundColor: theme.mapOverlay,
            border: `1px solid ${theme.border}`,
            borderRadius: "4px",
            padding: "6px 10px",
            display: "flex",
            gap: "12px",
          }}
        >
          <span
            style={{
              color: theme.sos,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
            }}
          >
            ⚠ 1 SOS
          </span>
          <span
            style={{
              color: theme.green,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
            }}
          >
            ● 2 MOVING
          </span>
        </div>
      </div>

      <style>{`
        @keyframes mapBreathe {
          0%, 100% { r: 3; opacity: 0.3; }
          50% { r: 5; opacity: 0.7; }
        }
        @keyframes mapSosPulse {
          0% { opacity: 0.2; r: 2; }
          100% { opacity: 0.8; r: 6; }
        }
      `}</style>
    </section>
  );
}