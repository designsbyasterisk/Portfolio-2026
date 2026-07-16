// Restease Design System (RDS) — Design Tokens

export const colors = {
  sosOrange: "#FF4F00",
  commandBlack: "#0D0D0D",
  kineticGreen: "#00E676",
  staticGrey: "#8E8E93",
  signalWhite: "#FFFFFF",
  // Derived surfaces
  surface01: "#1A1A1A",
  surface02: "#242424",
  surface03: "#2E2E2E",
} as const;

export const typography = {
  primary: "'Inter', sans-serif",
  secondary: "'JetBrains Mono', monospace",
  scale: {
    h1: { size: "32px", label: "Mission Status" },
    h2: { size: "20px", label: "Unit Headers" },
    body: { size: "16px", label: "General Data" },
    caption: { size: "12px", label: "Secondary Telemetry" },
  },
} as const;

export const tokens = {
  radiusUi: "8px",
  borderThick: "2px",
  elevHigh: "0px 8px 16px rgba(0,0,0,0.5)",
  hapticHeavy: "250ms",
} as const;

export const colorPalette = [
  {
    name: "SOS Orange",
    hex: "#FF4F00",
    usage: "Critical actions, SOS alerts, SOS button.",
    role: "Signal/Alert",
    textColor: "#FFFFFF",
  },
  {
    name: "Command Black",
    hex: "#0D0D0D",
    usage: "Backgrounds, primary UI housing.",
    role: "Grounding",
    textColor: "#FFFFFF",
    border: true,
  },
  {
    name: "Kinetic Green",
    hex: "#00E676",
    usage: "Moving units, safe status, battery healthy.",
    role: "Progress",
    textColor: "#0D0D0D",
  },
  {
    name: "Static Grey",
    hex: "#8E8E93",
    usage: "Stationary units, inactive hardware.",
    role: "Passive",
    textColor: "#FFFFFF",
  },
  {
    name: "Signal White",
    hex: "#FFFFFF",
    usage: "Primary text, high-contrast icons.",
    role: "Legibility",
    textColor: "#0D0D0D",
    border: true,
  },
] as const;

export const tokenTable = [
  {
    name: "radius-ui",
    value: "8px",
    description: "For buttons and cards (Professional/Ergonomic).",
  },
  {
    name: "border-thick",
    value: "2px",
    description: 'For all UI borders to maintain "Gear" aesthetic.',
  },
  {
    name: "elev-high",
    value: "0px 8px 16px rgba(0,0,0,0.5)",
    description: "For SOS modals to pull forward.",
  },
  {
    name: "haptic-heavy",
    value: "250ms burst",
    description: "For hardware SOS trigger.",
  },
] as const;
