import { useState } from "react";
import { useNavigate } from "react-router";
import { MissionMap } from "../components/app/MissionMap";
import { useApp } from "../context/AppContext";

export function DashboardScreen() {
  const navigate = useNavigate();
  const { units, hasActiveSOS, simulateSOS, theme: t, rainRate, landslideRisk } = useApp();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [showPaths, setShowPaths] = useState(true);
  const [showGeofence, setShowGeofence] = useState(true);

  const statusColor = (s: string) =>
    s === "sos" ? t.accent : s === "moving" ? t.green : s === "disconnected" ? t.border : t.textMuted;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Minimal header ── */}
      <div style={{
        height: "36px",
        backgroundColor: t.bg,
        borderBottom: `1px solid ${t.borderLight}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 14px", flexShrink: 0,
        transition: "background-color 0.3s",
      }}>
        {/* Left: op name */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{
            width: "5px", height: "5px", borderRadius: "50%",
            backgroundColor: t.green, animation: "breathe 4s ease-in-out infinite",
          }} />
          <span style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600 }}>
            OP KERALA RESCUE
          </span>
          <span style={{ color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
            {units.filter(u => u.status !== "disconnected").length}/{units.length}
          </span>
        </div>

        {/* Right: layer toggles */}
        <div style={{ display: "flex", gap: "5px" }}>
          {[
            { label: "PATH", active: showPaths, fn: () => setShowPaths(v => !v) },
            { label: "ZONE", active: showGeofence, fn: () => setShowGeofence(v => !v) },
          ].map(ctrl => (
            <button key={ctrl.label} onClick={ctrl.fn} style={{
              padding: "2px 7px", borderRadius: "4px", cursor: "pointer",
              backgroundColor: ctrl.active ? t.accentSoft : "transparent",
              border: `1px solid ${ctrl.active ? t.accent : t.border}`,
              color: ctrl.active ? t.accent : t.textMuted,
              fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", letterSpacing: "0.04em",
            }}>
              {ctrl.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Weather & Hazard Alert Banner ── */}
      <div style={{
        backgroundColor: t.bgCard2,
        borderBottom: `1px solid ${t.borderLight}`,
        padding: "6px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "11px",
        fontFamily: "'JetBrains Mono', monospace",
        color: t.textSecondary,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: rainRate > 50 ? t.accent : t.green }}>🌧 {rainRate} mm/hr</span>
          <span style={{ color: t.textMuted }}>|</span>
          <span>HUMIDITY: 94%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>LANDSLIDE RISK:</span>
          <span style={{
            color: landslideRisk === "HIGH" || landslideRisk === "SEVERE" ? t.accent : landslideRisk === "MODERATE" ? t.textSecondary : t.green,
            fontWeight: "bold",
          }}>{landslideRisk}</span>
        </div>
      </div>

      {/* ── Map ── */}
      <MissionMap
        selectedUnitId={selectedUnitId}
        onUnitSelect={setSelectedUnitId}
        showPaths={showPaths}
        showGeofence={showGeofence}
      />

      {/* ── Unit strip ── */}
      <div style={{
        backgroundColor: t.bg,
        borderTop: `1px solid ${t.borderLight}`,
        flexShrink: 0,
        padding: "10px 14px",
        display: "flex", alignItems: "center", gap: "8px",
        transition: "background-color 0.3s",
      }}>

        {/* ALL CALL button */}
        <button
          onClick={() => { simulateSOS(); navigate("/app/sos"); }}
          style={{
            flexShrink: 0,
            height: "48px", width: "48px",
            borderRadius: "12px",
            backgroundColor: "transparent",
            border: `1.5px solid ${t.accent}`,
            color: t.accent,
            cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", letterSpacing: "0.04em" }}>
            ALL
          </span>
        </button>

        {/* Divider */}
        <div style={{ width: "1px", height: "36px", backgroundColor: t.borderLight, flexShrink: 0 }} />

        {/* Scrollable unit chips */}
        <div style={{ flex: 1, display: "flex", gap: "6px", overflowX: "auto", scrollbarWidth: "none" }}>
          {units.map(unit => {
            const sc = statusColor(unit.status);
            const isSel = selectedUnitId === unit.id;
            const batColor = unit.battery <= 20 ? t.accent : unit.battery <= 50 ? t.textSecondary : t.green;
            return (
              <button
                key={unit.id}
                onClick={() => setSelectedUnitId(isSel ? null : unit.id)}
                style={{
                  flexShrink: 0,
                  width: "62px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: isSel ? t.bgCard : t.bgCard2,
                  border: `1.5px solid ${isSel ? sc : t.borderLight}`,
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px",
                  opacity: unit.status === "disconnected" ? 0.4 : 1,
                  transition: "border-color 0.15s",
                }}
              >
                {/* Status dot */}
                <div style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  backgroundColor: sc,
                  animation: unit.status === "sos" ? "sosFlash 0.5s infinite alternate" : "none",
                }} />
                {/* Unit ID */}
                <span style={{
                  color: t.textPrimary,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px", fontWeight: 700,
                  lineHeight: 1,
                }}>
                  {unit.id.replace("UNIT-0", "U0")}
                </span>
                {/* Battery and Load Status */}
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  {unit.type === "stretcher" && (
                    <div style={{
                      width: "4px", height: "4px", borderRadius: "50%",
                      backgroundColor: unit.loadStatus === "loaded" ? t.accent : t.border,
                      boxShadow: unit.loadStatus === "loaded" ? `0 0 4px ${t.accent}` : 'none'
                    }} title={unit.loadStatus === "loaded" ? "Loaded" : "Empty"} />
                  )}
                  <span style={{
                    color: batColor,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "8px", lineHeight: 1,
                  }}>
                    {unit.status === "disconnected" ? "—" : `${unit.battery}%`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes breathe { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        @keyframes sosFlash { 0% { opacity: 0.4; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}
