import { TacticalUnitCard } from "./TacticalUnitCard";
import { ActionBar } from "./ActionBar";
import { useTheme } from "./ThemeContext";
import type { UnitData } from "./TacticalUnitCard";

const demoUnits: UnitData[] = [
  {
    id: "UNIT-01",
    name: "Alpha Team Lead",
    type: "personnel",
    status: "moving",
    speed: 2.4,
    battery: 88,
    signal: 4,
    coords: "37.7749° N, 122.4194° W",
    sector: "Sector 4 — North Ridge",
  },
  {
    id: "UNIT-02",
    name: "Medic Bravo",
    type: "stretcher",
    status: "stationary",
    speed: 0,
    battery: 61,
    signal: 3,
    coords: "37.7751° N, 122.4182° W",
    sector: "Sector 4 — Base Camp",
  },
  {
    id: "UNIT-07",
    name: "Scout Charlie",
    type: "personnel",
    status: "sos",
    speed: 0,
    battery: 15,
    signal: 1,
    coords: "37.7758° N, 122.4171° W",
    sector: "Sector 4 — East Slope",
  },
  {
    id: "UNIT-04",
    name: "Delta Support",
    type: "personnel",
    status: "disconnected",
    speed: 0,
    battery: 0,
    signal: 0,
    coords: "37.7742° N, 122.4200° W",
    sector: "Sector 3 — West Gully",
  },
];

export function ComponentsSection() {
  const { theme } = useTheme();

  return (
    <section id="components" className="mb-16">
      <div className="mb-6">
        <span
          className="text-xs tracking-widest uppercase mb-2 block"
          style={{ color: theme.sos, fontFamily: "'JetBrains Mono', monospace" }}
        >
          03 — UI Components
        </span>
        <h2
          className="mb-2"
          style={{ color: theme.textPrimary, fontSize: "32px", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
        >
          The Building Blocks
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: "16px", fontFamily: "'Inter', sans-serif" }}>
          Modular, state-aware components designed for zero cognitive friction.
        </p>
      </div>

      {/* A. Tactical Unit Cards */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span
            style={{
              color: theme.sos,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            A
          </span>
          <h3
            style={{
              color: theme.textPrimary,
              fontFamily: "'Inter', sans-serif",
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            Tactical Unit Cards
          </h3>
        </div>
        <p
          style={{
            color: theme.textSecondary,
            fontSize: "14px",
            fontFamily: "'Inter', sans-serif",
            marginBottom: "16px",
          }}
        >
          All four unit states:{" "}
          <span style={{ color: theme.green }}>Moving</span>,{" "}
          <span style={{ color: theme.grey }}>Stationary</span>,{" "}
          <span style={{ color: theme.sos }}>SOS Alert</span>, and{" "}
          <span style={{ color: theme.grey }}>Disconnected</span>.
        </p>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
        >
          {demoUnits.map((unit) => (
            <TacticalUnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      </div>

      {/* B. Action Bar */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span
            style={{
              color: theme.sos,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            B
          </span>
          <h3
            style={{
              color: theme.textPrimary,
              fontFamily: "'Inter', sans-serif",
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            The Action Bar (Bottom Dock)
          </h3>
        </div>
        <p
          style={{
            color: theme.textSecondary,
            fontSize: "14px",
            fontFamily: "'Inter', sans-serif",
            marginBottom: "16px",
          }}
        >
          Minimum{" "}
          <span style={{ color: theme.textPrimary }}>48–64px touch targets</span> for thumb-only or
          gloved-hand operation. Hit the SOS button to trigger the override overlay.
        </p>

        <div
          style={{
            backgroundColor: theme.surface2,
            borderRadius: "8px",
            border: `2px solid ${theme.border}`,
            padding: "16px",
          }}
        >
          <ActionBar />
        </div>
      </div>

      {/* State Logic callout */}
      <div
        style={{
          backgroundColor: theme.surface1,
          borderRadius: "8px",
          border: `2px solid ${theme.border}`,
          padding: "20px",
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
          boxShadow: theme.cardShadow,
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            backgroundColor: theme.surface3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ color: theme.sos, fontSize: "16px" }}>!</span>
        </div>
        <div>
          <div
            style={{
              color: theme.textPrimary,
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "4px",
            }}
          >
            State Logic Rule
          </div>
          <p
            style={{
              color: theme.textSecondary,
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          >
            Every component must have a{" "}
            <span style={{ color: theme.textSecondary, fontStyle: "italic" }}>Disconnected</span> state
            (greyed out) so the Admin knows immediately if a signal is lost. Minimum{" "}
            <span style={{ color: theme.textPrimary }}>7:1 contrast ratio</span> must always be maintained.
          </p>
        </div>
      </div>
    </section>
  );
}
