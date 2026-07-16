import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

const checks = [
  { id: "gps", label: "GPS Lock", value: "4 satellites", delay: 600 },
  { id: "nfc", label: "NFC Module", value: "READY", delay: 1200 },
  { id: "net", label: "Unit Network", value: "5/5 ONLINE", delay: 1900 },
  { id: "map", label: "Map Cache", value: "87.4 MB loaded", delay: 2600 },
];

export function InitScreen() {
  const navigate = useNavigate();
  const { theme: t } = useApp();
  const [phase, setPhase] = useState<"boot" | "checks" | "ready">("boot");
  const [completedChecks, setCompletedChecks] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const bootTimer = setTimeout(() => setPhase("checks"), 800);
    checks.forEach(({ id, delay }) => {
      setTimeout(() => {
        setCompletedChecks((prev) => [...prev, id]);
        setProgress(Math.round(((checks.findIndex((c) => c.id === id) + 1) / checks.length) * 100));
      }, delay);
    });
    const readyTimer = setTimeout(() => setPhase("ready"), 3200);
    return () => {
      clearTimeout(bootTimer);
      clearTimeout(readyTimer);
    };
  }, []);

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: t.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "background-color 0.3s",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${t.accentSoft} 1px, transparent 1px), linear-gradient(90deg, ${t.accentSoft} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              backgroundColor: t.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
              boxShadow: `0 0 32px ${t.accentSoft}`,
              animation: "logoBreath 3s ease-in-out infinite",
            }}
          >
            <span style={{ color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace", fontSize: "32px", fontWeight: 800 }}>
              R
            </span>
          </div>
          <div style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.01em", marginBottom: "4px" }}>
            Restease
          </div>
          <div style={{ color: t.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.15em" }}>
            RESCUE CONTROL v1.0
          </div>
        </div>

        {/* System checks */}
        {phase !== "boot" && (
          <div
            style={{
              backgroundColor: t.bgCard,
              borderRadius: "12px",
              border: `2px solid ${t.border}`,
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <div style={{ color: t.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", marginBottom: "12px" }}>
              OFFLINE INITIALIZATION
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {checks.map((check) => {
                const done = completedChecks.includes(check.id);
                return (
                  <div key={check.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          border: `2px solid ${done ? t.green : t.border}`,
                          backgroundColor: done ? t.greenSoft : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.3s",
                        }}
                      >
                        {done && (
                          <svg width="9" height="9" viewBox="0 0 10 10">
                            <polyline points="2,5 4,7.5 8,3" fill="none" stroke={t.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {!done && (
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: t.border, animation: "pulse 1s ease-in-out infinite" }} />
                        )}
                      </div>
                      <span style={{ color: done ? t.textPrimary : t.textMuted, fontFamily: "'Inter', sans-serif", fontSize: "13px", transition: "color 0.3s" }}>
                        {check.label}
                      </span>
                    </div>
                    <span style={{ color: done ? t.green : t.border, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", transition: "color 0.3s" }}>
                      {done ? check.value : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: "14px", height: "3px", backgroundColor: t.border, borderRadius: "2px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  backgroundColor: t.green,
                  borderRadius: "2px",
                  transition: "width 0.5s ease",
                  boxShadow: `0 0 8px ${t.greenSoft}`,
                }}
              />
            </div>
          </div>
        )}

        {/* Boot spinner */}
        {phase === "boot" && (
          <div className="flex justify-center mb-8">
            <div style={{ width: "32px", height: "32px", border: `2px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        )}

        {/* Begin Mission button */}
        {phase === "ready" && (
          <button
            onClick={() => navigate("/app/dashboard")}
            style={{
              width: "100%",
              minHeight: "56px",
              backgroundColor: t.accent,
              border: `2px solid ${t.accent}`,
              borderRadius: "12px",
              color: "#FFFFFF",
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: `0 0 24px ${t.accentSoft}`,
              animation: "readyPulse 2s ease-in-out infinite",
            }}
          >
            <span>BEGIN MISSION</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
      </div>

      <style>{`
        @keyframes logoBreath {
          0%, 100% { box-shadow: 0 0 20px ${t.accentSoft}; }
          50% { box-shadow: 0 0 40px ${t.accentSoft}; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        @keyframes readyPulse {
          0%, 100% { box-shadow: 0 0 16px ${t.accentSoft}; }
          50% { box-shadow: 0 0 32px ${t.accentSoft}; }
        }
      `}</style>
    </div>
  );
}
