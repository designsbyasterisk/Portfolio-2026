import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useApp } from "../context/AppContext";

export function IncidentScreen() {
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const { units, alerts, respondToAlert, dispatchUnit, theme: t } = useApp();
  const [selectedDispatchUnit, setSelectedDispatchUnit] = useState<string | null>(null);

  const unit = units.find((u) => u.id === unitId);
  const alert = alerts.find((a) => a.unitId === unitId);

  if (!unit) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: t.bg }}>
        <span style={{ color: t.textMuted, fontFamily: "'Inter', sans-serif" }}>Unit not found</span>
      </div>
    );
  }

  const responded = alert?.responded ?? false;
  const dispatchedUnitId = alert?.dispatchedUnitId;

  let etaText = "";
  let distanceText = "";
  if (responded && dispatchedUnitId) {
    const dUnit = units.find(u => u.id === dispatchedUnitId);
    if (dUnit) {
      const dLat = dUnit.lat - unit.lat;
      const dLng = dUnit.lng - unit.lng;
      const distDegrees = Math.sqrt(dLat * dLat + dLng * dLng);
      const distKm = distDegrees * 111; // Approx km per degree
      const speed = dUnit.speed || 4; // km/h
      const etaMinutes = (distKm / speed) * 60;
      distanceText = distKm.toFixed(2) + " km";
      etaText = Math.ceil(etaMinutes) + " mins";
    }
  }

  const handleRespond = () => {
    if (alert) {
      if (selectedDispatchUnit) {
        dispatchUnit(alert.id, selectedDispatchUnit);
      }
      respondToAlert(alert.id);
    }
  };

  const availableUnits = units.filter(u => u.id !== unitId && u.status !== "disconnected" && u.status !== "sos");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: t.bg, overflow: "hidden", transition: "background-color 0.3s" }}>
      {/* Back header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `2px solid ${t.borderLight}`,
          display: "flex", alignItems: "center", gap: "12px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate("/app/sos")}
          style={{
            width: "40px", height: "40px", borderRadius: "8px",
            backgroundColor: t.bgCard, border: `2px solid ${t.border}`,
            color: t.textPrimary, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div>
          <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.1em" }}>
            INCIDENT RESPONSE
          </div>
          <div style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 600 }}>
            {unit.id} — {unit.name}
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "4px 10px", borderRadius: "6px",
              backgroundColor: responded ? t.greenSoft : t.accentSoft,
              border: `1px solid ${responded ? t.green : t.accent}`,
              color: responded ? t.green : t.accent,
              fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 700,
              animation: !responded ? "sosFlash 0.5s ease-in-out infinite alternate" : "none",
            }}
          >
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: responded ? t.green : t.accent }} />
            {responded ? "RESPONDED" : "SOS ACTIVE"}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {/* A. Unit Identity */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", marginBottom: "8px" }}>
            A — UNIT IDENTITY
          </div>
          <div style={{ backgroundColor: t.bgCard, borderRadius: "12px", border: `2px solid ${t.border}`, padding: "14px 16px" }}>
            <div className="flex items-start gap-3">
              <div
                style={{
                  width: "44px", height: "44px", borderRadius: "10px",
                  backgroundColor: t.accentSoft, border: `2px solid ${t.accent}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <span style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", fontWeight: 700 }}>
                  {unit.id.replace("UNIT-0", "")}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 700, marginBottom: "2px" }}>
                  {unit.name}
                </div>
                <div style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px", marginBottom: "8px" }}>
                  {unit.role} · Radio {unit.radio}
                </div>
                <div style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                  Team Members:
                </div>
                {unit.team.map((member, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: t.accent }} />
                    <span style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "13px" }}>{member}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* B. Location */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", marginBottom: "8px" }}>
            B — LOCATION
          </div>
          <div style={{ backgroundColor: t.bgCard, borderRadius: "12px", border: `2px solid ${t.border}`, padding: "14px 16px" }}>
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px" }}>
                Precise GPS Co-ordinates
              </span>
            </div>
            <div style={{ color: t.green, fontFamily: "'JetBrains Mono', monospace", fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>
              {unit.lat.toFixed(4)}° N, {unit.lng.toFixed(4)}° E
            </div>
            <div style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px", marginBottom: "2px" }}>
              {unit.sector}
            </div>
            {alert && (
              <div
                style={{
                  marginTop: "10px", padding: "8px 12px", borderRadius: "6px",
                  backgroundColor: t.accentSoft, border: `1px solid ${t.accentSoft}`,
                }}
              >
                <span style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
                  ⚠ SOS triggered at {alert.timestamp} · {alert.elapsed}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* C. Response Trigger & Dispatch */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", marginBottom: "8px" }}>
            C — RESPONSE & DISPATCH
          </div>
          {responded ? (
            <div
              style={{
                backgroundColor: t.greenSoft,
                borderRadius: "12px",
                border: `2px solid ${t.green}`,
                padding: "20px 16px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  border: `2px solid ${t.green}`, display: "flex",
                  alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={t.green} strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ color: t.green, fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>
                HELP IS ON THE WAY
              </div>
              <div style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px", marginBottom: "8px" }}>
                Team notified. All Call broadcast sent.
              </div>
              {dispatchedUnitId && (
                <div style={{ backgroundColor: t.bg, padding: "10px", borderRadius: "6px", display: "inline-flex", flexDirection: "column", gap: "6px", alignItems: "center", marginTop: "4px" }}>
                  <span style={{ color: t.green, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: "bold" }}>
                    DISPATCHED: {dispatchedUnitId}
                  </span>
                  {distanceText && (
                    <span style={{ color: t.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
                      DIST: {distanceText} • ETA: {etaText}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "12px", marginBottom: "4px" }}>
                Select Unit to Dispatch:
              </div>
              <select 
                value={selectedDispatchUnit || ""} 
                onChange={(e) => setSelectedDispatchUnit(e.target.value)}
                style={{
                  padding: "12px", borderRadius: "8px", border: `1px solid ${t.border}`,
                  backgroundColor: t.bgCard, color: t.textPrimary,
                  fontFamily: "'Inter', sans-serif", fontSize: "14px"
                }}
              >
                <option value="">-- Optional: Select unit --</option>
                {availableUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.id} - {u.name} ({u.type})</option>
                ))}
              </select>

              <button
                onClick={handleRespond}
                style={{
                  width: "100%", minHeight: "64px", backgroundColor: t.accent,
                  border: "none", borderRadius: "12px", color: "#FFFFFF",
                  fontFamily: "'Inter', sans-serif", fontSize: "18px", fontWeight: 800,
                  cursor: "pointer", letterSpacing: "0.02em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  boxShadow: "0 0 32px rgba(255,79,0,0.4)",
                  animation: "sosPulse 0.5s ease-in-out infinite alternate",
                  marginTop: "8px"
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.4a16 16 0 0 0 5.69 5.69l.88-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {selectedDispatchUnit ? "DISPATCH UNIT" : "SEND HELP NOW"}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes sosFlash { 0% { opacity: 0.5; } 100% { opacity: 1; } }
        @keyframes sosPulse {
          0% { box-shadow: 0 0 16px rgba(255,79,0,0.4); }
          100% { box-shadow: 0 0 36px rgba(255,79,0,0.8); }
        }
      `}</style>
    </div>
  );
}
