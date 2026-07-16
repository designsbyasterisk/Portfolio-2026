import { tokenTable } from "./tokens";
import { useTheme } from "./ThemeContext";

export function TokenSection() {
  const { theme } = useTheme();

  return (
    <section id="tokens" className="mb-16">
      <div className="mb-6">
        <span
          className="text-xs tracking-widest uppercase mb-2 block"
          style={{ color: theme.sos, fontFamily: "'JetBrains Mono', monospace" }}
        >
          06 — Design Tokens
        </span>
        <h2
          className="mb-2"
          style={{ color: theme.textPrimary, fontSize: "32px", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
        >
          System Tokens
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: "16px", fontFamily: "'Inter', sans-serif" }}>
          Design decisions captured as tokens — the source of truth for developers.
        </p>
      </div>

      {/* Token table */}
      <div
        style={{
          backgroundColor: theme.surface1,
          borderRadius: "8px",
          border: `2px solid ${theme.border}`,
          overflow: "hidden",
          boxShadow: theme.cardShadow,
          marginBottom: "24px",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 2fr",
            backgroundColor: theme.surface2,
            borderBottom: `2px solid ${theme.border}`,
            padding: "12px 20px",
            gap: "16px",
          }}
        >
          {["Token Name", "Value", "Description"].map((col) => (
            <div
              key={col}
              style={{
                color: theme.textSecondary,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {col}
            </div>
          ))}
        </div>

        {tokenTable.map((row, i) => (
          <div
            key={row.name}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 2fr",
              padding: "16px 20px",
              gap: "16px",
              borderBottom: i < tokenTable.length - 1 ? `1px solid ${theme.border}` : "none",
              alignItems: "center",
              backgroundColor: i % 2 === 0 ? theme.surface1 : theme.surface2,
            }}
          >
            <span
              style={{
                color: theme.green,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
              }}
            >
              {row.name}
            </span>
            <span
              style={{
                color: theme.sos,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
              }}
            >
              {row.value}
            </span>
            <span
              style={{
                color: theme.textSecondary,
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
              }}
            >
              {row.description}
            </span>
          </div>
        ))}
      </div>

      {/* Priority rules */}
      <div
        style={{
          backgroundColor: theme.surface1,
          borderRadius: "8px",
          border: `2px solid ${theme.border}`,
          padding: "24px",
          boxShadow: theme.cardShadow,
        }}
      >
        <div
          style={{
            color: theme.textPrimary,
            fontFamily: "'Inter', sans-serif",
            fontSize: "16px",
            fontWeight: 600,
            marginBottom: "16px",
          }}
        >
          Implementation Priority
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-4 items-start">
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: theme.sos,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              1
            </span>
            <div>
              <span
                style={{
                  color: theme.textPrimary,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                High Contrast
              </span>
              <p
                style={{
                  color: theme.textSecondary,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  marginTop: "2px",
                }}
              >
                Always maintain a minimum{" "}
                <span style={{ color: theme.textPrimary }}>7:1 contrast ratio</span> — non-negotiable in
                field conditions.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: theme.surface3,
                color: theme.textSecondary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              2
            </span>
            <div>
              <span
                style={{
                  color: theme.textPrimary,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                State Logic
              </span>
              <p
                style={{
                  color: theme.textSecondary,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  marginTop: "2px",
                }}
              >
                Every component must have a{" "}
                <span style={{ color: theme.textSecondary, fontStyle: "italic" }}>Disconnected</span> state
                — greyed out so the Admin knows immediately if a signal is lost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
