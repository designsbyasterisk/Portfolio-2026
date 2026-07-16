import { useTheme } from "./ThemeContext";

export function TypographySection() {
  const { theme } = useTheme();

  const typeScale = [
    {
      tag: "H1",
      size: "32px",
      weight: 700,
      label: "Mission Status",
      sample: "OPERATION SUMMIT — ACTIVE",
      font: "'Inter', sans-serif",
    },
    {
      tag: "H2",
      size: "20px",
      weight: 600,
      label: "Unit Headers",
      sample: "Sector 4 — Rescue Teams",
      font: "'Inter', sans-serif",
    },
    {
      tag: "BODY",
      size: "16px",
      weight: 400,
      label: "General Data",
      sample: "All units are reporting stable telemetry. No critical alerts detected in the last 15 minutes.",
      font: "'Inter', sans-serif",
    },
    {
      tag: "CAPTION",
      size: "12px",
      weight: 400,
      label: "Secondary Telemetry",
      sample: "Last updated: 14:32:07 UTC  |  Signal strength: HIGH  |  Ping: 42ms",
      font: "'Inter', sans-serif",
    },
  ];

  const monoExamples = [
    { label: "Unit ID", value: "UNIT-07" },
    { label: "GPS Coordinates", value: "37.7749° N, 122.4194° W" },
    { label: "Timestamp", value: "2026-04-20T14:32:07Z" },
    { label: "Device ID", value: "RDS-HW-A4F9-2C" },
  ];

  return (
    <section id="typography" className="mb-16">
      <div className="mb-6">
        <span
          className="text-xs tracking-widest uppercase mb-2 block"
          style={{ color: theme.sos, fontFamily: "'JetBrains Mono', monospace" }}
        >
          01 — Visual Foundation
        </span>
        <h2
          className="mb-2"
          style={{ color: theme.textPrimary, fontSize: "32px", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
        >
          Typography
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: "16px", fontFamily: "'Inter', sans-serif" }}>
          The Data-Driven Type — Engineered for high-speed scanning under stress.
        </p>
      </div>

      {/* Primary Typeface */}
      <div
        style={{
          backgroundColor: theme.surface1,
          borderRadius: "8px",
          border: `2px solid ${theme.border}`,
          padding: "24px",
          marginBottom: "16px",
          boxShadow: theme.cardShadow,
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span
            style={{
              color: theme.sos,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Primary
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: theme.border }} />
          <span
            style={{
              color: theme.textSecondary,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
            }}
          >
            Inter (Variable)
          </span>
        </div>

        <div className="space-y-6">
          {typeScale.map((item) => (
            <div
              key={item.tag}
              className="flex gap-4"
              style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: "20px" }}
            >
              <div style={{ minWidth: "80px" }}>
                <div
                  style={{
                    color: theme.textSecondary,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "2px",
                  }}
                >
                  {item.tag}
                </div>
                <div
                  style={{
                    color: theme.sos,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "10px",
                  }}
                >
                  {item.size}
                </div>
                <div
                  style={{
                    color: theme.textSecondary,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "10px",
                    marginTop: "2px",
                  }}
                >
                  {item.label}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    color: theme.textPrimary,
                    fontFamily: item.font,
                    fontSize: item.size,
                    fontWeight: item.weight,
                    lineHeight: 1.3,
                  }}
                >
                  {item.sample}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Typeface */}
      <div
        style={{
          backgroundColor: theme.surface1,
          borderRadius: "8px",
          border: `2px solid ${theme.border}`,
          padding: "24px",
          boxShadow: theme.cardShadow,
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span
            style={{
              color: theme.green,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Secondary
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: theme.border }} />
          <span
            style={{
              color: theme.textSecondary,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
            }}
          >
            JetBrains Mono — Fixed width, no jitter
          </span>
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {monoExamples.map((ex) => (
            <div
              key={ex.label}
              style={{
                backgroundColor: theme.codeBlock,
                borderRadius: "6px",
                border: `2px solid ${theme.border}`,
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  color: theme.textSecondary,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11px",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {ex.label}
              </div>
              <div
                style={{
                  color: theme.green,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "14px",
                }}
              >
                {ex.value}
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            color: theme.textSecondary,
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            marginTop: "16px",
            borderTop: `1px solid ${theme.border}`,
            paddingTop: "12px",
          }}
        >
          Fixed-width prevents "jittering" when GPS coordinates and Unit IDs update in real-time.
        </p>
      </div>
    </section>
  );
}
