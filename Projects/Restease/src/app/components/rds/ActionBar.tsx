import { useState } from "react";
import { SOSIcon, MapPinIcon, CommsIcon, AcknowledgeIcon } from "./Icons";
import { useTheme } from "./ThemeContext";

export function ActionBar() {
  const { theme } = useTheme();
  const [sosActive, setSosActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "comms" | null>(null);

  return (
    <div style={{ position: "relative" }}>
      {/* SOS Expanded Overlay */}
      {sosActive && (
        <div
          style={{
            backgroundColor: theme.sos,
            borderRadius: "8px 8px 0 0",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            animation: "sosFlash 0.5s ease-in-out infinite alternate",
            minHeight: "140px",
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "0.15em",
            }}
          >
            ⚠ SOS OVERRIDE ACTIVE
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
            }}
          >
            All units have been alerted. Awaiting acknowledgement.
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setSosActive(false)}
              style={{
                backgroundColor: "rgba(0,0,0,0.25)",
                border: "2px solid rgba(255,255,255,0.4)",
                borderRadius: "8px",
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                padding: "12px 28px",
                cursor: "pointer",
                minHeight: "48px",
              }}
            >
              CANCEL SOS
            </button>
            <button
              style={{
                backgroundColor: "#FFFFFF",
                border: "2px solid #FFFFFF",
                borderRadius: "8px",
                color: theme.sos,
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 700,
                padding: "12px 28px",
                cursor: "pointer",
                minHeight: "48px",
              }}
            >
              ACKNOWLEDGE ALL
            </button>
          </div>
        </div>
      )}

      {/* Main Action Bar */}
      <div
        style={{
          backgroundColor: theme.surface1,
          borderTop: `2px solid ${sosActive ? theme.sos : theme.border}`,
          borderRadius: sosActive ? "0 0 8px 8px" : "8px",
          border: `2px solid ${sosActive ? theme.sos : theme.border}`,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Map button */}
        <button
          onClick={() => setActiveTab(activeTab === "map" ? null : "map")}
          style={{
            minWidth: "56px",
            minHeight: "56px",
            backgroundColor: activeTab === "map" ? theme.surface3 : "transparent",
            border: `2px solid ${activeTab === "map" ? theme.textPrimary : theme.border}`,
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            cursor: "pointer",
            flex: 1,
          }}
        >
          <MapPinIcon size={22} color={activeTab === "map" ? theme.textPrimary : theme.textSecondary} />
          <span
            style={{
              color: activeTab === "map" ? theme.textPrimary : theme.textSecondary,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              letterSpacing: "0.08em",
            }}
          >
            MAP
          </span>
        </button>

        {/* Comms button */}
        <button
          onClick={() => setActiveTab(activeTab === "comms" ? null : "comms")}
          style={{
            minWidth: "56px",
            minHeight: "56px",
            backgroundColor: activeTab === "comms" ? theme.surface3 : "transparent",
            border: `2px solid ${activeTab === "comms" ? theme.textPrimary : theme.border}`,
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            cursor: "pointer",
            flex: 1,
          }}
        >
          <CommsIcon size={22} color={activeTab === "comms" ? theme.textPrimary : theme.textSecondary} />
          <span
            style={{
              color: activeTab === "comms" ? theme.textPrimary : theme.textSecondary,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              letterSpacing: "0.08em",
            }}
          >
            COMMS
          </span>
        </button>

        {/* Acknowledge button */}
        <button
          style={{
            minWidth: "56px",
            minHeight: "56px",
            backgroundColor: "transparent",
            border: `2px solid ${theme.border}`,
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            cursor: "pointer",
            flex: 1,
          }}
        >
          <AcknowledgeIcon size={22} color={theme.green} />
          <span
            style={{
              color: theme.green,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              letterSpacing: "0.08em",
            }}
          >
            ACK
          </span>
        </button>

        {/* SOS Override Button */}
        <button
          onClick={() => setSosActive((v) => !v)}
          style={{
            minWidth: "80px",
            minHeight: "56px",
            backgroundColor: sosActive ? theme.sos : "transparent",
            border: `2px solid ${theme.sos}`,
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            cursor: "pointer",
            flex: 2,
            boxShadow: sosActive
              ? theme.mode === "dark"
                ? "0 0 20px rgba(255,79,0,0.5)"
                : "0 0 16px rgba(230,60,0,0.3)"
              : "none",
            transition: "all 0.2s",
          }}
        >
          <SOSIcon size={24} color={sosActive ? "#FFFFFF" : theme.sos} />
          <span
            style={{
              color: sosActive ? "#FFFFFF" : theme.sos,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            {sosActive ? "ACTIVE" : "SOS"}
          </span>
        </button>
      </div>
    </div>
  );
}
