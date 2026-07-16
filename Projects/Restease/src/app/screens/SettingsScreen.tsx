import { useState } from "react";
import { useApp } from "../context/AppContext";

function Toggle({ toggled, onToggle, theme: t }: { toggled: boolean; onToggle: () => void; theme: ReturnType<typeof useApp>["theme"] }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "44px", height: "24px", borderRadius: "12px",
        backgroundColor: toggled ? t.accent : t.toggleOff,
        border: "none", cursor: "pointer", position: "relative",
        transition: "background-color 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: "3px",
        left: toggled ? "23px" : "3px",
        width: "18px", height: "18px", borderRadius: "50%",
        backgroundColor: "#FFFFFF", transition: "left 0.2s",
      }} />
    </button>
  );
}

function SettingRow({ label, sublabel, value, onToggle, toggled, theme: t }: {
  label: string;
  sublabel?: string;
  value?: string;
  onToggle?: () => void;
  toggled?: boolean;
  theme: ReturnType<typeof useApp>["theme"];
}) {
  return (
    <div style={{
      padding: "14px 16px", borderBottom: `1px solid ${t.borderLight}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      minHeight: "56px",
    }}>
      <div>
        <div style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>{label}</div>
        {sublabel && (
          <div style={{ color: t.textMuted, fontFamily: "'Inter', sans-serif", fontSize: "11px", marginTop: "2px" }}>{sublabel}</div>
        )}
      </div>
      {onToggle !== undefined ? (
        <Toggle toggled={!!toggled} onToggle={onToggle} theme={t} />
      ) : value ? (
        <span style={{ color: t.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>
          {value}
        </span>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </div>
  );
}

export function SettingsScreen() {
  const { theme: t, toggleTheme } = useApp();
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [geofenceAlert, setGeofenceAlert] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [adminAccess, setAdminAccess] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string[]>(["sector4-high"]);

  const handleDownload = (id: string) => {
    setDownloading(id);
    setTimeout(() => {
      setDownloading(null);
      setDownloaded((prev) => [...prev, id]);
    }, 2500);
  };

  const mapTiles = [
    { id: "sector4-high", name: "Sector 4 — High Res", size: "87.4 MB", resolution: "1:5000" },
    { id: "sector3-med", name: "Sector 3 — Medium", size: "43.2 MB", resolution: "1:10000" },
    { id: "sector2-low", name: "Sector 2 — Overview", size: "12.8 MB", resolution: "1:25000" },
    { id: "all-sectors-base", name: "All Sectors — Base", size: "156 MB", resolution: "1:50000" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: t.bg, overflow: "hidden", transition: "background-color 0.3s" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: `2px solid ${t.borderLight}`, flexShrink: 0 }}>
        <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", marginBottom: "4px" }}>
          CONFIGURATION
        </div>
        <div style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "20px", fontWeight: 700 }}>
          Settings
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Display ──────────────────────────────────────────────────────── */}
        <div style={{ padding: "16px 16px 8px" }}>
          <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", marginBottom: "10px" }}>
            DISPLAY
          </div>
          <div style={{ backgroundColor: t.bgCard, borderRadius: "12px", border: `2px solid ${t.border}`, overflow: "hidden" }}>
            {/* Light mode toggle — featured row */}
            <div style={{
              padding: "16px",
              borderBottom: `1px solid ${t.borderLight}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: t.isLight
                ? "linear-gradient(135deg, rgba(204,57,0,0.06) 0%, rgba(242,238,231,0) 100%)"
                : "linear-gradient(135deg, rgba(255,79,0,0.08) 0%, rgba(19,19,19,0) 100%)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Sun/moon icon */}
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  backgroundColor: t.isLight ? t.accentSoft : t.bgCard2,
                  border: `1px solid ${t.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {t.isLight ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.textSecondary} strokeWidth="2" strokeLinecap="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600 }}>
                    {t.isLight ? "Light Mode" : "Dark Mode"}
                  </div>
                  <div style={{ color: t.textMuted, fontFamily: "'Inter', sans-serif", fontSize: "11px", marginTop: "1px" }}>
                    {t.isLight ? "Warm field-ready palette" : "Low-light tactical view"}
                  </div>
                </div>
              </div>
              <Toggle toggled={t.isLight} onToggle={toggleTheme} theme={t} />
            </div>

          </div>
        </div>

        {/* Map Downloads */}
        <div style={{ padding: "16px 16px 8px" }}>
          <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", marginBottom: "10px" }}>
            MAP DOWNLOADS
          </div>
          <div style={{ backgroundColor: t.bgCard, borderRadius: "12px", border: `2px solid ${t.border}`, overflow: "hidden" }}>
            {mapTiles.map((tile, i) => {
              const isDone = downloaded.includes(tile.id);
              const isLoading = downloading === tile.id;
              return (
                <div
                  key={tile.id}
                  style={{
                    padding: "12px 14px",
                    borderBottom: i < mapTiles.length - 1 ? `1px solid ${t.borderLight}` : "none",
                    display: "flex", alignItems: "center", gap: "12px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "13px", marginBottom: "2px" }}>
                      {tile.name}
                    </div>
                    <div style={{ color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
                      {tile.size} · {tile.resolution}
                    </div>
                  </div>
                  <button
                    onClick={() => !isDone && !isLoading && handleDownload(tile.id)}
                    disabled={isDone || isLoading}
                    style={{
                      minWidth: "72px", minHeight: "36px", borderRadius: "8px",
                      backgroundColor: isDone ? t.greenSoft : isLoading ? t.accentSoft : t.accent,
                      border: `1px solid ${isDone ? t.green : t.accent}`,
                      color: isDone ? t.green : isLoading ? t.accent : "#FFFFFF",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 700,
                      cursor: isDone ? "default" : "pointer", letterSpacing: "0.05em",
                      animation: isLoading ? "breathe 1s ease-in-out infinite" : "none",
                    }}
                  >
                    {isDone ? "✓ SAVED" : isLoading ? "..." : "GET"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alarm Profiles */}
        <div style={{ padding: "16px 16px 8px" }}>
          <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", marginBottom: "10px" }}>
            ALARM PROFILES
          </div>
          <div style={{ backgroundColor: t.bgCard, borderRadius: "12px", border: `2px solid ${t.border}`, overflow: "hidden" }}>
            <SettingRow label="SOS Alert" sublabel="High-freq staccato beep — Admin only" onToggle={() => setAlarmEnabled((v) => !v)} toggled={alarmEnabled} theme={t} />
            <SettingRow label="Geofence Alert" sublabel="Trigger when unit enters danger zone" onToggle={() => setGeofenceAlert((v) => !v)} toggled={geofenceAlert} theme={t} />
            <SettingRow label="SOS Volume" value="MAX" theme={t} />
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.borderLight}` }}>
              <div style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "14px", marginBottom: "8px" }}>A&R Chime Volume</div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>LOW</span>
                <div style={{ flex: 1, height: "4px", backgroundColor: t.bgCard2, borderRadius: "2px", position: "relative" }}>
                  <div style={{ width: "65%", height: "100%", backgroundColor: t.accent, borderRadius: "2px" }} />
                  <div style={{ position: "absolute", left: "63%", top: "-5px", width: "14px", height: "14px", borderRadius: "50%", backgroundColor: t.bgCard, border: `2px solid ${t.accent}`, cursor: "pointer" }} />
                </div>
                <span style={{ color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>HIGH</span>
              </div>
            </div>
            <SettingRow label="Two-Note Chime" sublabel="Do–Sol harmonic (sine-wave)" value="DEFAULT" theme={t} />
          </div>
        </div>

        {/* Permissions */}
        <div style={{ padding: "16px 16px 24px" }}>
          <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", marginBottom: "10px" }}>
            PERMISSIONS
          </div>
          <div style={{ backgroundColor: t.bgCard, borderRadius: "12px", border: `2px solid ${t.border}`, overflow: "hidden" }}>
            <SettingRow label="Offline Mode" sublabel="Operate without internet connection" onToggle={() => setOfflineMode((v) => !v)} toggled={offlineMode} theme={t} />
            <SettingRow label="Geofence Admin" sublabel="Allow editing of danger/safe zones" onToggle={() => setAdminAccess((v) => !v)} toggled={adminAccess} theme={t} />
            <SettingRow label="SOS Override" sublabel="Override dashboard on distress signal" value="ENABLED" theme={t} />
            <SettingRow label="Unit NFC Pairing" sublabel="Allow new device pairing" value="ALL" theme={t} />
          </div>

          {/* Version info */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <div style={{ color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.08em" }}>RESTEASE v1.0</div>
            <div style={{ color: t.border, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", marginTop: "4px" }}>
              BUILD 2026.04.21
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes breathe { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
}
