import { createContext, useContext, useState, ReactNode } from "react";

export interface RDSTheme {
  mode: "dark" | "light";
  bg: string;
  surface1: string;
  surface2: string;
  surface3: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  sos: string;
  green: string;
  greenDim: string;
  grey: string;
  headerBg: string;
  heroGradient: string;
  heroGridColor: string;
  mapBg: string;
  mapGrid: string;
  mapTopo: string;
  mapOverlay: string;
  codeBlock: string;
  cardShadow: string;
  footerText: string;
}

export const darkTheme: RDSTheme = {
  mode: "dark",
  bg: "#0D0D0D",
  surface1: "#1A1A1A",
  surface2: "#242424",
  surface3: "#2E2E2E",
  border: "#2E2E2E",
  borderSubtle: "#1A1A1A",
  textPrimary: "#FFFFFF",
  textSecondary: "#8E8E93",
  textTertiary: "#636366",
  sos: "#FF4F00",
  green: "#00E676",
  greenDim: "rgba(0,230,118,0.3)",
  grey: "#8E8E93",
  headerBg: "rgba(13,13,13,0.95)",
  heroGradient: "linear-gradient(135deg, #0D0D0D 0%, #1A0A00 50%, #0D0D0D 100%)",
  heroGridColor: "rgba(255,79,0,0.04)",
  mapBg: "#111111",
  mapGrid: "#1F1F1F",
  mapTopo: "#1D2A1D",
  mapOverlay: "rgba(13,13,13,0.85)",
  codeBlock: "#0D0D0D",
  cardShadow: "0px 8px 16px rgba(0,0,0,0.5)",
  footerText: "#2E2E2E",
};

export const lightTheme: RDSTheme = {
  mode: "light",
  bg: "#F5F5F7",
  surface1: "#FFFFFF",
  surface2: "#F0F0F2",
  surface3: "#E5E5EA",
  border: "#D1D1D6",
  borderSubtle: "#E5E5EA",
  textPrimary: "#0D0D0D",
  textSecondary: "#636366",
  textTertiary: "#A0A0A8",
  sos: "#E63C00",   // slightly deeper for light bg contrast
  green: "#007A3D", // dark enough for 4.5:1 on white
  greenDim: "rgba(0,122,61,0.15)",
  grey: "#8E8E93",
  headerBg: "rgba(245,245,247,0.95)",
  heroGradient: "linear-gradient(135deg, #F5F5F7 0%, #FFF3EE 50%, #F5F5F7 100%)",
  heroGridColor: "rgba(255,79,0,0.07)",
  mapBg: "#E8EDE8",
  mapGrid: "#C8D4C8",
  mapTopo: "#A8C4A8",
  mapOverlay: "rgba(245,245,247,0.92)",
  codeBlock: "#F0F0F2",
  cardShadow: "0px 4px 12px rgba(0,0,0,0.08)",
  footerText: "#A0A0A8",
};

interface ThemeContextValue {
  theme: RDSTheme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? darkTheme : lightTheme;
  const toggle = () => setIsDark((v) => !v);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
