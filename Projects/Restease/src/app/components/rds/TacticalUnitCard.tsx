import { SignalStrengthIcon, BatteryIcon, PersonnelIcon, StretcherIcon, DisconnectedIcon } from "./Icons";
import { useTheme } from "./ThemeContext";

export type UnitStatus = "moving" | "stationary" | "sos" | "disconnected";

export interface UnitData {
  id: string;
  name: string;
  type: "personnel" | "stretcher";
  status: UnitStatus;
  speed: number;
  battery: number;
  signal: 0 | 1 | 2 | 3 | 4;
  coords: string;
  sector: string;
}

interface TacticalUnitCardProps {
  unit: UnitData;
  compact?: boolean;
}

export function TacticalUnitCard({ unit, compact = false }: TacticalUnitCardProps) {
  const { theme } = useTheme();

  const statusConfig: Record<UnitStatus, { label: string; color: string }> = {
    moving: { label: "MOVING", color: theme.green },
    stationary: { label: "STATIC", color: theme.grey },
    sos: { label: "SOS", color: theme.sos },
    disconnected: { label: "OFFLINE", color: theme.grey },
  };

  const cfg = statusConfig[unit.status];
  const isDisconnected = unit.status === "disconnected";
  const isSOS = unit.status === "sos";
  const isMoving = unit.status === "moving";

  const borderColor = isSOS ? theme.sos : isMoving ? theme.green : theme.border;
  const bgColor = isDisconnected
    ? theme.mode === "dark" ? "#131313" : "#F8F8FA"
    : theme.surface1;

  const movingGlow = theme.mode === "dark"
    ? "0 0 16px rgba(0,230,118,0.2), 0px 8px 16px rgba(0,0,0,0.5)"
    : "0 0 12px rgba(0,122,61,0.15), 0px 4px 12px rgba(0,0,0,0.08)";
  const sosGlow = theme.mode === "dark"
    ? "0 0 20px rgba(255,79,0,0.35), 0px 8px 16px rgba(0,0,0,0.5)"
    : "0 0 16px rgba(230,60,0,0.2), 0px 4px 12px rgba(0,0,0,0.08)";

  return (
    <div
      style={{
        backgroundColor: bgColor,
        borderRadius: "8px",
        border: `2px solid ${borderColor}`,
        padding: compact ? "12px" : "16px",
        position: "relative",
        boxShadow: isSOS ? sosGlow : isMoving ? movingGlow : theme.cardShadow,
        opacity: isDisconnected ? 0.6 : 1,
        minWidth: "220px",
        animation: isSOS
          ? "sosPulse 0.5s ease-in-out infinite alternate"
          : isMoving
          ? "breathe 4s ease-in-out infinite"
          : "none",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isDisconnected ? (
            <DisconnectedIcon size={16} color={theme.grey} />
          ) : unit.type === "personnel" ? (
            <PersonnelIcon size={16} color={cfg.color} />
          ) : (
            <StretcherIcon size={16} color={cfg.color} />
          )}
          <span
            style={{
              color: isDisconnected ? theme.textSecondary : theme.textPrimary,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {unit.id}
          </span>
        </div>

        {/* Status badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "3px 8px",
            borderRadius: "4px",
            backgroundColor: isDisconnected ? theme.surface3 : `${cfg.color}18`,
            border: `1px solid ${isDisconnected ? theme.border : cfg.color}`,
            color: cfg.color,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            letterSpacing: "0.08em",
          }}
        >
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: cfg.color,
              display: "inline-block",
            }}
          />
          {cfg.label}
        </span>
      </div>

      {/* Name & Sector */}
      {!compact && (
        <div className="mb-3">
          <div
            style={{
              color: isDisconnected ? theme.textSecondary : theme.textPrimary,
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              marginBottom: "2px",
            }}
          >
            {unit.name}
          </div>
          <div style={{ color: theme.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "11px" }}>
            {unit.sector}
          </div>
        </div>
      )}

      {/* GPS Coords */}
      {!compact && (
        <div
          style={{
            color: isDisconnected ? theme.textSecondary : theme.green,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            marginBottom: "12px",
            opacity: isDisconnected ? 0.5 : 1,
          }}
        >
          {unit.coords}
        </div>
      )}

      {/* Telemetry row */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          paddingTop: "12px",
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        {/* Speed */}
        <div>
          <div
            style={{
              color: theme.textSecondary,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "2px",
            }}
          >
            Speed
          </div>
          <div
            style={{
              color: isDisconnected ? theme.textSecondary : theme.textPrimary,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "13px",
            }}
          >
            {isDisconnected ? "--" : `${unit.speed}km/h`}
          </div>
        </div>

        {/* Battery */}
        <div>
          <div
            style={{
              color: theme.textSecondary,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "2px",
            }}
          >
            Batt
          </div>
          <div className="flex items-center gap-1">
            <BatteryIcon
              size={14}
              level={isDisconnected ? 0 : unit.battery}
              color={theme.textPrimary}
              fillColor={isDisconnected ? theme.grey : unit.battery <= 20 ? theme.sos : theme.green}
            />
            <span
              style={{
                color: isDisconnected ? theme.textSecondary : unit.battery <= 20 ? theme.sos : theme.textPrimary,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
              }}
            >
              {isDisconnected ? "--" : `${unit.battery}%`}
            </span>
          </div>
        </div>

        {/* Signal */}
        <div className="ml-auto">
          <div
            style={{
              color: theme.textSecondary,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "2px",
            }}
          >
            Sig
          </div>
          <SignalStrengthIcon
            size={14}
            level={isDisconnected ? 0 : unit.signal}
            color={isDisconnected ? theme.grey : unit.signal < 2 ? theme.sos : theme.green}
          />
        </div>
      </div>
    </div>
  );
}
