import { PersonnelIcon, SOSIcon } from "./Icons";
import { useTheme } from "./ThemeContext";

export function MotionSection() {
  const { theme } = useTheme();

  return (
    <section id="motion" className="mb-16">
      <div className="mb-6">
        <span
          className="text-xs tracking-widest uppercase mb-2 block"
          style={{ color: theme.sos, fontFamily: "'JetBrains Mono', monospace" }}
        >
          04 — Interaction Design
        </span>
        <h2
          className="mb-2"
          style={{ color: theme.textPrimary, fontSize: "32px", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
        >
          Motion & Micro-Interactions
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: "16px", fontFamily: "'Inter', sans-serif" }}>
          Purposeful animation that communicates system state without distraction.
        </p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {/* Breathing Pulse */}
        <div
          style={{
            backgroundColor: theme.surface1,
            borderRadius: "8px",
            border: `2px solid ${theme.border}`,
            padding: "24px",
            boxShadow: theme.cardShadow,
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: theme.surface2,
                border: `2px solid ${theme.green}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "breatheGlowAnim 4s ease-in-out infinite",
                position: "relative",
              }}
            >
              <PersonnelIcon size={32} color={theme.green} />
              <div
                style={{
                  position: "absolute",
                  inset: "-8px",
                  borderRadius: "50%",
                  border: `1px solid ${theme.greenDim}`,
                  animation: "breatheRingAnim 4s ease-in-out infinite",
                }}
              />
            </div>
            <div className="text-center">
              <div
                style={{
                  color: theme.green,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                The Pulse
              </div>
              <div
                style={{
                  color: theme.textPrimary,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                Active Unit Breathing
              </div>
              <p style={{ color: theme.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: 1.5 }}>
                4s cycle — slow "breathing" glow confirms the system is still receiving live data.
              </p>
            </div>
            <div
              style={{
                backgroundColor: theme.codeBlock,
                borderRadius: "6px",
                padding: "8px 16px",
                border: `1px solid ${theme.border}`,
              }}
            >
              <span style={{ color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>
                animation: 4s ease-in-out infinite
              </span>
            </div>
          </div>
        </div>

        {/* SOS Flash */}
        <div
          style={{
            backgroundColor: theme.surface1,
            borderRadius: "8px",
            border: `2px solid ${theme.sos}`,
            padding: "24px",
            boxShadow: theme.cardShadow,
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: theme.surface2,
                border: `2px solid ${theme.sos}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "sosFlashGlowAnim 0.5s ease-in-out infinite alternate",
                position: "relative",
              }}
            >
              <SOSIcon size={32} color={theme.sos} />
              <div
                style={{
                  position: "absolute",
                  inset: "-10px",
                  borderRadius: "50%",
                  border: `2px solid ${theme.sos}`,
                  opacity: 0.4,
                  animation: "sosRingAnim 0.5s ease-in-out infinite alternate",
                }}
              />
            </div>
            <div className="text-center">
              <div
                style={{
                  color: theme.sos,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                The Alert
              </div>
              <div
                style={{
                  color: theme.textPrimary,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                SOS Flash
              </div>
              <p style={{ color: theme.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: 1.5 }}>
                0.5s cycle — rapid flash demands immediate attention, impossible to overlook.
              </p>
            </div>
            <div
              style={{
                backgroundColor: theme.codeBlock,
                borderRadius: "6px",
                padding: "8px 16px",
                border: `1px solid ${theme.border}`,
              }}
            >
              <span style={{ color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>
                animation: 0.5s ease-in-out infinite alternate
              </span>
            </div>
          </div>
        </div>

        {/* Instant Cut */}
        <div
          style={{
            backgroundColor: theme.surface1,
            borderRadius: "8px",
            border: `2px solid ${theme.border}`,
            padding: "24px",
            boxShadow: theme.cardShadow,
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "8px",
                backgroundColor: theme.surface2,
                border: `2px solid ${theme.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              ⚡
            </div>
            <div className="text-center">
              <div
                style={{
                  color: theme.textSecondary,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Transition
              </div>
              <div
                style={{
                  color: theme.textPrimary,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                Instant Cut
              </div>
              <p style={{ color: theme.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: 1.5 }}>
                Dashboard → SOS View uses an "Instant Cut," not a fade. Speed is the priority.
              </p>
            </div>
            <div
              style={{
                backgroundColor: theme.codeBlock,
                borderRadius: "6px",
                padding: "8px 16px",
                border: `1px solid ${theme.border}`,
              }}
            >
              <span style={{ color: theme.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>
                transition: none — 0ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sonic Brand */}
      <div
        style={{
          backgroundColor: theme.surface1,
          borderRadius: "8px",
          border: `2px solid ${theme.border}`,
          padding: "20px",
          marginTop: "16px",
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          boxShadow: theme.cardShadow,
        }}
      >
        <div
          style={{
            color: theme.textSecondary,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            minWidth: "80px",
            paddingTop: "2px",
          }}
        >
          Sonic Brand
        </div>
        <div className="flex gap-6 flex-wrap">
          <div>
            <div style={{ color: theme.sos, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", marginBottom: "4px" }}>
              SOS Alert
            </div>
            <p style={{ color: theme.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px" }}>
              High-frequency dissonant "staccato" beep — Admin-only
            </p>
          </div>
          <div>
            <div style={{ color: theme.green, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", marginBottom: "4px" }}>
              A&R Chime
            </div>
            <p style={{ color: theme.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px" }}>
              "Two-Note" harmonic Do–Sol, smooth sine-wave to evoke calm
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes breatheGlowAnim {
          0%, 100% { box-shadow: 0 0 6px ${theme.greenDim}; border-color: ${theme.green}80; }
          50% { box-shadow: 0 0 20px ${theme.greenDim}; border-color: ${theme.green}; }
        }
        @keyframes breatheRingAnim {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.2); opacity: 0.6; }
        }
        @keyframes sosFlashGlowAnim {
          0% { box-shadow: 0 0 6px ${theme.sos}33; }
          100% { box-shadow: 0 0 28px ${theme.sos}99; }
        }
        @keyframes sosRingAnim {
          0% { transform: scale(1); opacity: 0.2; }
          100% { transform: scale(1.3); opacity: 0.6; }
        }
        @keyframes breathe {
          0%, 100% { box-shadow: 0 0 6px ${theme.greenDim}; }
          50% { box-shadow: 0 0 18px ${theme.greenDim}; }
        }
        @keyframes sosFlash {
          0% { background-color: ${theme.sos}; }
          100% { background-color: ${theme.sos}cc; }
        }
        @keyframes sosPulse {
          0% { box-shadow: 0 0 12px ${theme.sos}50, ${theme.cardShadow}; border-color: ${theme.sos}99; }
          100% { box-shadow: 0 0 28px ${theme.sos}bb, ${theme.cardShadow}; border-color: ${theme.sos}; }
        }
      `}</style>
    </section>
  );
}
