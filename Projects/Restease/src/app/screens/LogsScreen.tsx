import { useState } from "react";
import { incidentLogs, movementPaths, maintenanceLogs } from "../data/mockData";
import { useApp } from "../context/AppContext";

type LogTab = "incidents" | "movement" | "maintenance";

function IncidentHistory() {
  const { theme: t } = useApp();
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
      {incidentLogs.map((log) => (
        <div
          key={log.id}
          style={{
            backgroundColor: t.bgCard,
            borderRadius: "10px",
            border: `2px solid ${!log.resolved ? t.accent : t.border}`,
            padding: "12px 14px",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span style={{
                padding: "2px 8px", borderRadius: "4px",
                backgroundColor: log.type === "SOS" ? t.accentSoft : t.bgCard2,
                color: log.type === "SOS" ? t.accent : t.textSecondary,
                fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em",
              }}>
                {log.type}
              </span>
              <span style={{ color: t.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>
                {log.unitId}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: log.resolved ? t.green : t.accent }} />
              <span style={{ color: log.resolved ? t.green : t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "9px" }}>
                {log.resolved ? "RESOLVED" : "ACTIVE"}
              </span>
            </div>
          </div>

          <p style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "13px", lineHeight: 1.5, marginBottom: "8px" }}>
            {log.description}
          </p>

          <div className="flex items-center gap-3">
            <span style={{ color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
              {log.date} · {log.time}
            </span>
            {log.duration && (
              <span style={{ color: t.textSecondary, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
                ⏱ {log.duration}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MovementAnalytics() {
  const { theme: t } = useApp();
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <p style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "13px", lineHeight: 1.5, marginBottom: "4px" }}>
        Reviewing paths taken to improve rescue routes.
      </p>
      {movementPaths.map((path) => (
        <div
          key={path.unitId + path.date}
          style={{ backgroundColor: t.bgCard, borderRadius: "10px", border: `2px solid ${t.border}`, padding: "14px" }}
        >
          <div className="flex items-center justify-between mb-10px">
            <div>
              <span style={{ color: t.textPrimary, fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: 700 }}>
                {path.unitId}
              </span>
              <span style={{ color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", marginLeft: "8px" }}>
                {path.date}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginTop: "8px", marginBottom: "10px" }}>
            {[
              { label: "DIST", value: `${path.totalDistanceKm}km` },
              { label: "TIME", value: `${path.durationMin}min` },
              { label: "WPTS", value: `${path.waypoints}` },
              { label: "AVG", value: `${path.avgSpeed}km/h` },
            ].map((stat) => (
              <div key={stat.label} style={{ backgroundColor: t.bgCard2, borderRadius: "6px", padding: "6px 8px", textAlign: "center" }}>
                <div style={{ color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", letterSpacing: "0.08em", marginBottom: "2px" }}>
                  {stat.label}
                </div>
                <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 600 }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Mini path visualization */}
          <div style={{ height: "40px", backgroundColor: t.bgCard2, borderRadius: "6px", marginBottom: "8px", overflow: "hidden", position: "relative" }}>
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
              <polyline
                points="5,35 15,28 25,32 35,20 45,24 55,16 65,20 75,12 85,16 95,10"
                fill="none" stroke={t.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              <circle cx="5" cy="35" r="2.5" fill={t.green} />
              <circle cx="95" cy="10" r="2.5" fill={t.accent} />
            </svg>
          </div>

          <p style={{ color: t.textMuted, fontFamily: "'Inter', sans-serif", fontSize: "11px", lineHeight: 1.4 }}>
            {path.notes}
          </p>
        </div>
      ))}
    </div>
  );
}

function MaintenanceLog() {
  const { theme: t } = useApp();
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <p style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "13px", lineHeight: 1.5, marginBottom: "4px" }}>
        Flagged and resolved hardware issues.
      </p>
      {maintenanceLogs.map((log) => (
        <div
          key={log.id}
          style={{
            backgroundColor: t.bgCard,
            borderRadius: "10px",
            border: `2px solid ${log.flagged ? (log.severity === "high" ? t.accent : t.textSecondary) : t.border}`,
            padding: "12px 14px",
            display: "flex", gap: "12px", alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: "32px", height: "32px", borderRadius: "8px",
              backgroundColor: log.severity === "high" ? t.accentSoft : log.severity === "medium" ? `${t.textSecondary}22` : t.bgCard2,
              border: `1px solid ${log.severity === "high" ? t.accent : t.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: "2px",
            }}
          >
            <span style={{ fontSize: "14px" }}>
              {log.severity === "high" ? "⚠" : log.severity === "medium" ? "!" : "✓"}
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: t.textPrimary, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 700 }}>
                {log.unitId}
              </span>
              {log.flagged && (
                <span style={{
                  padding: "1px 6px", borderRadius: "3px",
                  backgroundColor: t.accentSoft, color: t.accent,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "9px",
                }}>
                  FLAGGED
                </span>
              )}
            </div>
            <div style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: 1.4, marginBottom: "4px" }}>
              {log.issue}
            </div>
            <div style={{ color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
              {log.date}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const logTabs: { id: LogTab; label: string }[] = [
  { id: "incidents", label: "INCIDENTS" },
  { id: "movement", label: "ROUTES" },
  { id: "maintenance", label: "MAINT." },
];

export function LogsScreen() {
  const { theme: t } = useApp();
  const [activeTab, setActiveTab] = useState<LogTab>("incidents");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: t.bg, overflow: "hidden", transition: "background-color 0.3s" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 0", borderBottom: `2px solid ${t.borderLight}`, flexShrink: 0 }}>
        <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", marginBottom: "4px" }}>
          MISSION LOGS & REPORTS
        </div>
        <div style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>
          Field Records
        </div>
        <div style={{ display: "flex", gap: "2px" }}>
          {logTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, minHeight: "36px",
                backgroundColor: activeTab === tab.id ? t.bgCard : "transparent",
                border: "none",
                borderBottom: `2px solid ${activeTab === tab.id ? t.accent : "transparent"}`,
                color: activeTab === tab.id ? t.textPrimary : t.textMuted,
                fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
                letterSpacing: "0.05em", cursor: "pointer", paddingBottom: "8px",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "incidents" && <IncidentHistory />}
        {activeTab === "movement" && <MovementAnalytics />}
        {activeTab === "maintenance" && <MaintenanceLog />}
      </div>
    </div>
  );
}
