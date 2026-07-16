export interface ThemeTokens {
  // Core backgrounds
  bg: string;
  bgCard: string;
  bgCard2: string;

  // Borders
  border: string;
  borderLight: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Brand accent (orange)
  accent: string;
  accentSoft: string;
  accentText: string;

  // Status green
  green: string;
  greenSoft: string;

  // UI chrome
  toggleOff: string;
  isLight: boolean;

  // Phone frame
  phoneBg: string;
  phoneShell: string;
  phoneShellInner: string;
  notchBg: string;
  homeIndicator: string;

  // Map overlays (HTML elements on top of SVG canvas)
  mapOverlayBg: string;
  mapOverlayBorder: string;
  mapOverlayText: string;
  mapOverlayMuted: string;
  mapOverlayDivider: string;
  mapLegendOffline: string;
  mapCanvasBg: string;

  // Map SVG terrain
  mapTerrainBgA: string;
  mapTerrainBgB: string;
  mapTerrainBgC: string;
  mapForestBg: string;
  mapRockyBg: string;
  mapTopoClose: string;
  mapTopoFar: string;
  mapRidge: string;
  mapForestDot: string;
  mapRockyMark: string;
  mapCliff: string;
  mapStreamA: string;
  mapStreamB: string;
  mapTrail: string;
  mapGrid: string;
  mapElevText: string;
  mapGridLabel: string;
  mapSummitFill: string;
  mapSummitStroke: string;
  mapVignette: string;
  mapCompassBg: string;
  mapCompassStroke: string;
  mapCompassSouth: string;
}

// ─── Dark Mode (6:1 contrast — slightly softened from pure black/white) ──────

export const darkTheme: ThemeTokens = {
  bg: "#131313",
  bgCard: "#1E1E1E",
  bgCard2: "#161616",
  border: "#2C2C2C",
  borderLight: "#222222",
  textPrimary: "#E6E6E6",
  textSecondary: "#9C9C9C",
  textMuted: "#5C5C5C",
  accent: "#FF4F00",
  accentSoft: "rgba(255,79,0,0.12)",
  accentText: "#FFFFFF",
  green: "#00E676",
  greenSoft: "rgba(0,230,118,0.08)",
  toggleOff: "#2C2C2C",
  isLight: false,

  phoneBg: "#090909",
  phoneShell: "#282828",
  phoneShellInner: "#1A1A1A",
  notchBg: "#131313",
  homeIndicator: "#2C2C2C",

  mapOverlayBg: "rgba(13,13,13,0.88)",
  mapOverlayBorder: "#2C2C2C",
  mapOverlayText: "#9C9C9C",
  mapOverlayMuted: "#5C5C5C",
  mapOverlayDivider: "#2C2C2C",
  mapLegendOffline: "#3A3A3A",
  mapCanvasBg: "#0E1910",

  mapTerrainBgA: "#0B120E",
  mapTerrainBgB: "#0F1A10",
  mapTerrainBgC: "#121E12",
  mapForestBg: "#0E1A0E",
  mapRockyBg: "#121210",
  mapTopoClose: "#2A3820",
  mapTopoFar: "#1E2E1A",
  mapRidge: "#2E3A26",
  mapForestDot: "#1E3020",
  mapRockyMark: "#2A2820",
  mapCliff: "#3A3226",
  mapStreamA: "#1A2E42",
  mapStreamB: "#1E3850",
  mapTrail: "#2A2A18",
  mapGrid: "#141A14",
  mapElevText: "#243020",
  mapGridLabel: "#1E2E1E",
  mapSummitFill: "#3A3632",
  mapSummitStroke: "#4A4238",
  mapVignette: "rgba(0,0,0,0.5)",
  mapCompassBg: "rgba(13,13,13,0.7)",
  mapCompassStroke: "#2C2C2C",
  mapCompassSouth: "#3A3A3A",
};

// ─── Light Mode (warm sandy field-tool, 6:1 contrast) ─────────────────────────

export const lightTheme: ThemeTokens = {
  bg: "#F2EEE7",
  bgCard: "#FEFCF9",
  bgCard2: "#EAE5DD",
  border: "#D6CFC7",
  borderLight: "#E4DED6",
  textPrimary: "#1C1916",
  textSecondary: "#66605A",
  textMuted: "#9B958E",
  accent: "#CC3900",
  accentSoft: "rgba(204,57,0,0.1)",
  accentText: "#FFFFFF",
  green: "#006B38",
  greenSoft: "rgba(0,107,56,0.08)",
  toggleOff: "#C8C2BA",
  isLight: true,

  phoneBg: "#DDD7CF",
  phoneShell: "#B8B3AA",
  phoneShellInner: "#D0C9C0",
  notchBg: "#F2EEE7",
  homeIndicator: "#D6CFC7",

  mapOverlayBg: "rgba(252,250,246,0.94)",
  mapOverlayBorder: "#D6CFC7",
  mapOverlayText: "#66605A",
  mapOverlayMuted: "#9B958E",
  mapOverlayDivider: "#D6CFC7",
  mapLegendOffline: "#9B958E",
  mapCanvasBg: "#D2C8B2",

  mapTerrainBgA: "#C8BDA4",
  mapTerrainBgB: "#C4B99A",
  mapTerrainBgC: "#BCB090",
  mapForestBg: "#A8B888",
  mapRockyBg: "#C0AF90",
  mapTopoClose: "#907558",
  mapTopoFar: "#A89070",
  mapRidge: "#887060",
  mapForestDot: "#60804A",
  mapRockyMark: "#9A8A70",
  mapCliff: "#8A7860",
  mapStreamA: "#6888A8",
  mapStreamB: "#7898B8",
  mapTrail: "#907A50",
  mapGrid: "#C8BC9A",
  mapElevText: "#786050",
  mapGridLabel: "#786050",
  mapSummitFill: "#8A7A60",
  mapSummitStroke: "#7A6A50",
  mapVignette: "rgba(180,160,130,0.25)",
  mapCompassBg: "rgba(252,250,246,0.8)",
  mapCompassStroke: "#D6CFC7",
  mapCompassSouth: "#9B958E",
};
