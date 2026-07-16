import { useState } from "react";
import { colorPalette } from "./tokens";
import { useTheme } from "./ThemeContext";

export function ColorSection() {
  const { theme } = useTheme();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex).catch(() => {});
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <section id="colors" className="mb-16">
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
          Color Palette
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: "16px", fontFamily: "'Inter', sans-serif" }}>
          The Safety Spectrum — High-contrast colors distinguishable under glare or low-light.
        </p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {colorPalette.map((swatch) => (
          <button
            key={swatch.hex}
            onClick={() => handleCopy(swatch.hex)}
            className="text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              borderRadius: "8px",
              border: `2px solid ${theme.border}`,
              overflow: "hidden",
              cursor: "pointer",
              boxShadow: theme.cardShadow,
            }}
          >
            {/* Color swatch */}
            <div
              style={{
                backgroundColor: swatch.hex,
                height: "80px",
                display: "flex",
                alignItems: "flex-end",
                padding: "8px 12px",
              }}
            >
              {copied === swatch.hex && (
                <span
                  style={{
                    color: swatch.textColor,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    opacity: 0.8,
                  }}
                >
                  COPIED ✓
                </span>
              )}
            </div>
            {/* Info */}
            <div style={{ backgroundColor: theme.surface1, padding: "14px 16px" }}>
              <div className="flex items-center justify-between mb-1">
                <span
                  style={{
                    color: theme.textPrimary,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {swatch.name}
                </span>
                <span
                  style={{
                    color: swatch.hex === "#0D0D0D" || swatch.hex === "#8E8E93" || swatch.hex === "#FFFFFF"
                      ? theme.textSecondary
                      : swatch.hex,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "12px",
                  }}
                >
                  {swatch.hex}
                </span>
              </div>
              <p
                style={{
                  color: theme.textSecondary,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  marginBottom: "8px",
                }}
              >
                {swatch.usage}
              </p>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  backgroundColor: theme.surface3,
                  color: theme.textSecondary,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {swatch.role}
              </span>
            </div>
          </button>
        ))}
      </div>
      <p
        style={{
          color: theme.textSecondary,
          fontSize: "12px",
          fontFamily: "'JetBrains Mono', monospace",
          marginTop: "12px",
        }}
      >
        ↑ Click any swatch to copy hex value
      </p>
    </section>
  );
}
