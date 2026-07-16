import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

export function SOSScreen() {
  const navigate = useNavigate();
  const { alerts, units, acknowledgeAlert, theme: t } = useApp();

  const activeAlerts = alerts.filter((a) => !a.responded);
  const resolvedAlerts = alerts.filter((a) => a.responded);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: t.bg, transition: "background-color 0.3s" }}>
      {/* SOS Header */}
      <div
        style={{
          backgroundColor: activeAlerts.length > 0 ? `rgba(255,79,0,0.1)` : t.bg,
          borderBottom: `2px solid ${t.accent}`,
          padding: "14px 16px",
          flexShrink: 0,
          animation: activeAlerts.length > 0 ? "sosBg 0.5s ease-in-out infinite alternate" : "none",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            style={{
              width: "32px", height: "32px", borderRadius: "50%",
              backgroundColor: t.accent, display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
              animation: activeAlerts.length > 0 ? "sosPulse 0.5s ease-in-out infinite alternate" : "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", fontWeight: 700, letterSpacing: "0.08em" }}>
              {activeAlerts.length > 0 ? `${activeAlerts.length} ACTIVE SOS` : "SOS CLEAR"}
            </div>
            <div style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "11px" }}>
              Quick Action — Incident Override
            </div>
          </div>
        </div>

        {activeAlerts.length > 0 && (
          <button
            style={{
              width: "100%", minHeight: "48px", backgroundColor: t.accent,
              border: "none", borderRadius: "10px", color: "#FFFFFF",
              fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", letterSpacing: "0.02em",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
            BROADCAST ALL CALL
          </button>
        )}
      </div>

      {/* Alert list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {activeAlerts.length === 0 && resolvedAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4" style={{ paddingTop: "40px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: `2px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.green} strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ color: t.green, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>ALL CLEAR</div>
            <div style={{ color: t.textMuted, fontFamily: "'Inter', sans-serif", fontSize: "12px", textAlign: "center" }}>
              No active distress signals.
            </div>
          </div>
        )}

        {activeAlerts.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", marginBottom: "8px" }}>
              ACTIVE ALERTS — CHRONOLOGICAL
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {activeAlerts.map((alert) => {
                const unit = units.find((u) => u.id === alert.unitId);
                return (
                  <div
                    key={alert.id}
                    style={{
                      backgroundColor: t.bgCard,
                      borderRadius: "12px",
                      border: `2px solid ${t.accent}`,
                      overflow: "hidden",
                      boxShadow: `0 0 16px ${t.accentSoft}`,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: t.accentSoft,
                        padding: "10px 14px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        borderBottom: `1px solid ${t.accentSoft}`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: t.accent, animation: "sosFlash 0.5s ease-in-out infinite alternate" }} />
                        <span style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: 700 }}>
                          {alert.unitId}
                        </span>
                        <span style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px" }}>
                          {alert.unitName}
                        </span>
                      </div>
                      <span style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
                        {alert.elapsed}
                      </span>
                    </div>

                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "11px", marginBottom: "4px" }}>
                        {alert.sector}
                      </div>
                      <div style={{ color: t.green, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", marginBottom: "10px" }}>
                        {alert.coords}
                      </div>
                      {unit && (
                        <div className="flex items-center gap-3 mb-10px">
                          <span style={{ color: t.textMuted, fontFamily: "'Inter', sans-serif", fontSize: "11px" }}>Battery:</span>
                          <span style={{ color: unit.battery <= 20 ? t.accent : t.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>
                            {unit.battery}%
                          </span>
                          <span style={{ color: t.textMuted, fontFamily: "'Inter', sans-serif", fontSize: "11px" }}>· Signal:</span>
                          <span style={{ color: unit.signal < 2 ? t.accent : t.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>
                            {unit.signal}/4
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          style={{
                            flex: 1, minHeight: "44px", backgroundColor: "transparent",
                            border: `2px solid ${t.border}`, borderRadius: "8px",
                            color: t.textSecondary, fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "11px", cursor: "pointer",
                          }}
                        >
                          ACK
                        </button>
                        <button
                          onClick={() => navigate(`/app/sos/${alert.unitId}`)}
                          style={{
                            flex: 3, minHeight: "44px", backgroundColor: t.accent,
                            border: "none", borderRadius: "8px", color: "#FFFFFF",
                            fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700,
                            cursor: "pointer", letterSpacing: "0.02em",
                          }}
                        >
                          OPEN INCIDENT →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {resolvedAlerts.length > 0 && (
          <div>
            <div style={{ color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", marginBottom: "8px" }}>
              RESOLVED
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {resolvedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    backgroundColor: t.bgCard2,
                    borderRadius: "10px",
                    border: `1px solid ${t.borderLight}`,
                    padding: "10px 14px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    opacity: 0.6,
                  }}
                >
                  <div>
                    <span style={{ color: t.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>
                      {alert.unitId}
                    </span>
                    <span style={{ color: t.textMuted, fontFamily: "'Inter', sans-serif", fontSize: "11px", marginLeft: "8px" }}>
                      {alert.unitName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: t.green }} />
                    <span style={{ color: t.green, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>RESPONDED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes sosBg {
          0% { background-color: rgba(255,79,0,0.06); }
          100% { background-color: rgba(255,79,0,0.14); }
        }
        @keyframes sosPulse {
          0% { box-shadow: 0 0 8px rgba(255,79,0,0.4); }
          100% { box-shadow: 0 0 20px rgba(255,79,0,0.9); }
        }
        @keyframes sosFlash { 0% { opacity: 0.4; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}
