import { useNavigate, useLocation } from "react-router";
import { useApp } from "../../context/AppContext";

const tabs = [
  {
    id: "dashboard",
    path: "/app/dashboard",
    label: "MAP",
    icon: (active: boolean, _sos: boolean, iconColor: string, mutedColor: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? iconColor : mutedColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    id: "inventory",
    path: "/app/inventory",
    label: "KIT",
    icon: (active: boolean, _sos: boolean, iconColor: string, mutedColor: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? iconColor : mutedColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    id: "sos",
    path: "/app/sos",
    label: "SOS",
    icon: (_active: boolean, hasSOS: boolean, _iconColor: string, _mutedColor: string) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={hasSOS ? "#FFFFFF" : "#FF4F00"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    isSOS: true,
  },
  {
    id: "logs",
    path: "/app/logs",
    label: "LOGS",
    icon: (active: boolean, _sos: boolean, iconColor: string, mutedColor: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? iconColor : mutedColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "settings",
    path: "/app/settings",
    label: "CONFIG",
    icon: (active: boolean, _sos: boolean, iconColor: string, mutedColor: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? iconColor : mutedColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasActiveSOS, theme: t } = useApp();

  return (
    <div
      style={{
        height: "64px",
        backgroundColor: t.bg,
        borderTop: `1px solid ${t.borderLight}`,
        display: "flex",
        alignItems: "stretch",
        paddingBottom: "6px",
        flexShrink: 0,
        transition: "background-color 0.3s, border-color 0.3s",
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path);
        const isSOS = tab.isSOS;
        const sosHasAlert = isSOS && hasActiveSOS;

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              position: "relative",
            }}
          >
            {isSOS ? (
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: sosHasAlert ? "#FF4F00" : t.bgCard,
                  border: `2px solid #FF4F00`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "-18px",
                  boxShadow: sosHasAlert
                    ? "0 0 16px rgba(255,79,0,0.6)"
                    : `0 2px 8px rgba(0,0,0,${t.isLight ? 0.12 : 0.4})`,
                  animation: sosHasAlert ? "sosPulse 0.5s ease-in-out infinite alternate" : "none",
                }}
              >
                {tab.icon(isActive, sosHasAlert, t.textPrimary, t.textMuted)}
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                {tab.icon(isActive, false, t.textPrimary, t.textMuted)}
              </div>
            )}

            <span
              style={{
                color: isSOS ? "#FF4F00" : isActive ? t.textPrimary : t.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "8px",
                letterSpacing: "0.06em",
                marginTop: isSOS ? "2px" : "0",
              }}
            >
              {tab.label}
            </span>

            {isActive && !isSOS && (
              <div
                style={{
                  position: "absolute",
                  bottom: "0px",
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  backgroundColor: t.accent,
                }}
              />
            )}
          </button>
        );
      })}

      <style>{`
        @keyframes sosPulse {
          0% { box-shadow: 0 0 10px rgba(255,79,0,0.4); }
          100% { box-shadow: 0 0 24px rgba(255,79,0,0.9); }
        }
      `}</style>
    </div>
  );
}