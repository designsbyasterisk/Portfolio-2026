import { useState } from "react";
import { units, personnelAssignments } from "../data/mockData";
import { useApp } from "../context/AppContext";

type InventoryTab = "pairing" | "diagnostics" | "personnel" | "activity";

function UnitPairing() {
  const { theme: t } = useApp();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState<string | null>(null);

  const handleScan = () => {
    setScanning(true);
    setScanned(null);
    setTimeout(() => {
      setScanning(false);
      setScanned("UNIT-06");
    }, 2000);
  };

  // NFC card dynamic colors
  const nfcAccent = scanned ? t.green : scanning ? t.green : t.accent;
  const nfcSoft = scanned ? t.greenSoft : scanning ? t.greenSoft : t.accentSoft;

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <p style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "13px", lineHeight: 1.5 }}>
        NFC scanner to link a chipset to a specific stretcher. Hold device near the unit chipset.
      </p>

      {/* NFC scan area */}
      <button
        onClick={handleScan}
        disabled={scanning}
        style={{
          width: "100%",
          backgroundColor: t.bgCard,
          border: "none",
          borderRadius: "16px",
          cursor: scanning ? "default" : "pointer",
          padding: "16px 16px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0",
          position: "relative",
          overflow: "hidden",
          textAlign: "left",
        }}
      >
        {/* Card header row */}
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <span style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 700 }}>
            Unit Pairing
          </span>
          
        </div>

        {/* Rotating diamond scan zone */}
        <div style={{ position: "relative", width: "148px", height: "148px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
          {/* Rotating dashed diamond border */}
          <div style={{
            position: "absolute",
            width: "108px",
            height: "108px",
            borderRadius: "16px",
            border: `2.5px dashed ${nfcAccent}`,
            backgroundColor: nfcSoft,
            animation: scanned
              ? "none"
              : scanning
              ? "spinDiamond 1.4s linear infinite"
              : "spinDiamond 5s linear infinite",
            transition: "border-color 0.4s, background-color 0.4s",
          }} />
          {/* Outer ghost ring (idle only) */}
          {!scanning && !scanned && (
            <div style={{
              position: "absolute",
              width: "130px",
              height: "130px",
              borderRadius: "20px",
              border: `1px dashed ${t.accentSoft}`,
              animation: "spinDiamond 9s linear infinite reverse",
            }} />
          )}
          {/* Icon */}
          <div style={{ position: "relative", zIndex: 1, color: nfcAccent, transition: "color 0.4s" }}>
            {scanned ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {/* Card / phone body */}
                <rect x="6" y="2" width="12" height="20" rx="2.5" />
                {/* Top indicator dot */}
                <circle cx="12" cy="6" r="1" fill="currentColor" strokeWidth="0" />
                {/* NFC arcs radiating from lower-left of card */}
                <path d="M 8 20 A 3 3 0 0 1 11 17" />
                <path d="M 8 20 A 6 6 0 0 1 14 14" />
                <path d="M 8 20 A 9 9 0 0 1 17 11" />
              </svg>
            )}
          </div>
          {/* Scanning ripple */}
          {scanning && (
            <div style={{
              position: "absolute",
              width: "108px", height: "108px",
              borderRadius: "50%",
              border: `1px solid ${t.greenSoft}`,
              animation: "nfcRipple 1.2s ease-out infinite",
            }} />
          )}
        </div>

        {/* Status label */}
        <div style={{
          color: nfcAccent,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em",
          marginBottom: "6px", transition: "color 0.4s",
        }}>
          {scanning ? "SCANNING..." : scanned ? `PAIRED: ${scanned}` : "AWAITING DEVICE"}
        </div>

        {/* Subtitle */}
        <div style={{ color: t.textMuted, fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: 1.4 }}>
          {scanning
            ? "Hold device near unit chipset"
            : scanned
            ? "Chipset linked. Tap to pair another unit."
            : "Place tag near reader to authenticate"}
        </div>

        <style>{`
          @keyframes spinDiamond {
            0%   { transform: rotate(45deg); }
            100% { transform: rotate(405deg); }
          }
          @keyframes nfcRipple {
            0%   { transform: scale(0.9); opacity: 0.8; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}</style>
      </button>

      {scanned && (
        <div
          style={{
            backgroundColor: t.greenSoft,
            border: `2px solid ${t.green}`,
            borderRadius: "10px",
            padding: "12px 16px",
          }}
        >
          <div style={{ color: t.green, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
            UNIT PAIRED SUCCESSFULLY
          </div>
          <div style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px" }}>
            Chipset ID: RDS-HW-A4F9-2C linked to {scanned}
          </div>
        </div>
      )}
    </div>
  );
}

function SOSDiagnostics() {
  const { theme: t } = useApp();
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
      <p style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "13px", lineHeight: 1.5, marginBottom: "4px" }}>
        Chipset diagnostics — signal health, battery, alarm test.
      </p>
      {units.map((unit) => (
        <div
          key={unit.id}
          style={{
            backgroundColor: t.bgCard,
            borderRadius: "10px",
            border: `2px solid ${unit.status === "sos" ? t.accent : unit.status === "disconnected" ? t.bgCard : t.border}`,
            padding: "12px 14px",
            opacity: unit.status === "disconnected" ? 0.5 : 1,
          }}
        >
          <div className="flex items-center justify-between mb-8px">
            <div className="flex items-center gap-2">
              <span style={{ color: t.textPrimary, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 700 }}>
                {unit.id}
              </span>
              <span style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "11px" }}>
                {unit.name}
              </span>
            </div>
            <span style={{
              padding: "2px 8px", borderRadius: "4px",
              backgroundColor: unit.status === "sos" ? t.accentSoft : unit.status === "moving" ? t.greenSoft : t.bgCard2,
              color: unit.status === "sos" ? t.accent : unit.status === "disconnected" ? t.textMuted : unit.status === "moving" ? t.green : t.textSecondary,
              fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              {unit.status}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "8px" }}>
            {[
              { label: "Signal", value: `${unit.signal}/4`, color: unit.signal === 0 ? t.textMuted : unit.signal < 2 ? t.accent : t.green },
              { label: "Battery", value: `${unit.battery}%`, color: unit.battery === 0 ? t.textMuted : unit.battery <= 20 ? t.accent : t.green },
              { label: "Alarm", value: unit.status === "disconnected" ? "—" : "OK", color: unit.status === "disconnected" ? t.textMuted : t.green },
            ].map((stat) => (
              <div key={stat.label} style={{ backgroundColor: t.bgCard2, borderRadius: "6px", padding: "6px 8px" }}>
                <div style={{ color: t.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>
                  {stat.label}
                </div>
                <div style={{ color: stat.color, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 600 }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PersonnelAssignment() {
  const { theme: t } = useApp();
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
      <p style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "13px", lineHeight: 1.5, marginBottom: "4px" }}>
        Names and radio channels assigned to each Restease unit.
      </p>
      {personnelAssignments.map((pa) => {
        const unit = units.find((u) => u.id === pa.unitId);
        return (
          <div
            key={pa.unitId}
            style={{
              backgroundColor: t.bgCard,
              borderRadius: "10px",
              border: `2px solid ${t.border}`,
              padding: "12px 14px",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: t.textPrimary, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 700 }}>
                {pa.unitId}
              </span>
              <span style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>
                {pa.radioChannel}
              </span>
            </div>
            {pa.members.map((m, i) => (
              <div key={i} className="flex items-center gap-2 mb-1">
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: t.green }} />
                <span style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "12px" }}>{m}</span>
              </div>
            ))}
            {unit && (
              <div style={{ marginTop: "8px", color: t.textMuted, fontFamily: "'Inter', sans-serif", fontSize: "11px" }}>
                {unit.sector}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function UnitActivity() {
  const { theme: t } = useApp();
  const statusColor = (s: string) =>
    s === "sos" ? t.accent : s === "moving" ? t.green : s === "disconnected" ? t.textMuted : t.textSecondary;
  const statusLabel = (s: string) =>
    s === "sos" ? "ALERT" : s === "moving" ? "ACTIVE" : s === "disconnected" ? "OFFLINE" : "RESTING";

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <p style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "13px", lineHeight: 1.5, marginBottom: "4px" }}>
        All connected units and their current status.
      </p>
      {units.map((unit) => (
        <div
          key={unit.id}
          style={{
            backgroundColor: t.bgCard,
            borderRadius: "10px",
            border: `2px solid ${statusColor(unit.status)}22`,
            padding: "12px 14px",
            display: "flex", alignItems: "center", gap: "12px",
          }}
        >
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            backgroundColor: statusColor(unit.status), flexShrink: 0,
            animation: unit.status === "sos" ? "sosFlash 0.5s ease-in-out infinite alternate" : unit.status === "moving" ? "breathe 4s ease-in-out infinite" : "none",
          }} />
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2">
              <span style={{ color: t.textPrimary, fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", fontWeight: 700 }}>
                {unit.id}
              </span>
              <span style={{ color: t.textSecondary, fontFamily: "'Inter', sans-serif", fontSize: "11px" }}>
                {unit.name}
              </span>
              {unit.type === "stretcher" && unit.loadStatus && (
                <span style={{ 
                  backgroundColor: unit.loadStatus === "loaded" ? t.accentSoft : t.bgCard2,
                  color: unit.loadStatus === "loaded" ? t.accent : t.textSecondary,
                  padding: "2px 4px", borderRadius: "4px", fontSize: "9px", fontFamily: "'JetBrains Mono', monospace"
                }}>
                  {unit.loadStatus.toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ color: t.textMuted, fontFamily: "'Inter', sans-serif", fontSize: "11px", marginTop: "2px" }}>
              {unit.sector}
            </div>
          </div>
          <span style={{
            padding: "3px 8px", borderRadius: "4px",
            backgroundColor: `${statusColor(unit.status)}18`,
            color: statusColor(unit.status),
            fontFamily: "'JetBrains Mono', monospace", fontSize: "9px",
            letterSpacing: "0.08em", fontWeight: 700,
          }}>
            {statusLabel(unit.status)}
          </span>
        </div>
      ))}
      <style>{`
        @keyframes breathe { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes sosFlash { 0% { opacity: 0.4; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}

const inventoryTabs: { id: InventoryTab; label: string }[] = [
  { id: "pairing", label: "PAIR" },
  { id: "diagnostics", label: "DIAG" },
  { id: "personnel", label: "CREW" },
  { id: "activity", label: "STATUS" },
];

export function InventoryScreen() {
  const { theme: t } = useApp();
  const [activeTab, setActiveTab] = useState<InventoryTab>("pairing");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: t.bg, overflow: "hidden", transition: "background-color 0.3s" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 0", borderBottom: `2px solid ${t.borderLight}`, flexShrink: 0 }}>
        <div style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", marginBottom: "4px" }}>
          INVENTORY
        </div>
        <div style={{ color: t.textPrimary, fontFamily: "'Inter', sans-serif", fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>
          The Kit
        </div>
        <div style={{ display: "flex", gap: "2px" }}>
          {inventoryTabs.map((tab) => (
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
                letterSpacing: "0.06em", cursor: "pointer", paddingBottom: "8px",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "pairing" && <UnitPairing />}
        {activeTab === "diagnostics" && <SOSDiagnostics />}
        {activeTab === "personnel" && <PersonnelAssignment />}
        {activeTab === "activity" && <UnitActivity />}
      </div>
    </div>
  );
}