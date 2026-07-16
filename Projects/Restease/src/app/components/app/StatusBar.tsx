import { useApp } from "../../context/AppContext";

interface StatusBarProps {
  sosActive?: boolean;
}

export function StatusBar({ sosActive }: StatusBarProps) {
  const { missionTime, hasActiveSOS, isOffline, theme: t } = useApp();
  const isAlert = sosActive || hasActiveSOS;

  return (
    <div
      style={{
        height: "36px",
        backgroundColor: isAlert ? `rgba(255,79,0,0.10)` : t.bg,
        borderBottom: `1px solid ${isAlert ? t.accent : t.borderLight}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        flexShrink: 0,
        transition: "background-color 0.3s",
      }}
    >
      <span
        style={{
          color: isAlert ? t.accent : t.textMuted,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "10px",
          letterSpacing: "0.04em",
        }}
      >
        {missionTime}
      </span>

      <span
        style={{
          color: t.borderLight,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "9px",
          letterSpacing: "0.08em",
          opacity: isAlert ? 0 : 1,
          transition: "opacity 0.2s",
        }}
      >
        RESTEASE
      </span>

      {/* Signal bars only */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px" }}>
        {isOffline && (
          <span style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: "bold" }}>
            OFFLINE
          </span>
        )}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "2px" }}>
          {[3, 5, 7, 9].map((h, i) => (
            <div
              key={i}
              style={{
                width: "3px",
                height: `${h}px`,
                backgroundColor: isOffline ? t.border : i < 4 ? t.green : t.border,
                borderRadius: "1px",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}