import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider, useApp } from "./context/AppContext";

function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { theme } = useApp();
  const t = theme;

  const isEmbed = new URLSearchParams(window.location.search).get("embed") === "true";

  if (isEmbed) {
    return (
      <div style={{ width: "100%", height: "100%", backgroundColor: t.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
        <style>{`
          * { box-sizing: border-box; }
          html, body, #root { height: 100%; margin: 0; padding: 0; overflow: hidden !important; background-color: #000000 !important; }
          ::-webkit-scrollbar { display: none; }
          scrollbar-width: none;
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: t.phoneBg,
        backgroundImage: t.isLight
          ? "linear-gradient(rgba(204,57,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(204,57,0,0.015) 1px, transparent 1px)"
          : "linear-gradient(rgba(255,79,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,79,0,0.025) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.3s",
      }}
    >
      {/* Desktop label */}
      

      {/* Phone shell */}
      <div
        style={{
          width: "393px",
          height: "852px",
          borderRadius: "52px",
          border: `3px solid ${t.phoneShell}`,
          backgroundColor: t.bg,
          overflow: "hidden",
          position: "relative",
          boxShadow: t.isLight
            ? `0 32px 80px rgba(0,0,0,0.25), inset 0 0 0 1px ${t.phoneShellInner}`
            : `0 32px 80px rgba(0,0,0,0.9), inset 0 0 0 1px ${t.phoneShellInner}`,
          display: "flex",
          flexDirection: "column",
          transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s",
        }}
      >
        {/* Notch */}
        
        {/* Content area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", paddingTop: "0px" }}>
          {children}
        </div>
        {/* Home indicator */}
        <div
          style={{
            height: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: t.bg,
            flexShrink: 0,
            transition: "background-color 0.3s",
          }}
        >
          <div style={{ width: "120px", height: "4px", backgroundColor: t.homeIndicator, borderRadius: "2px" }} />
        </div>
      </div>

      <style>{`
        @media (max-width: 440px) {}
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        scrollbar-width: none;
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}

function AppInner() {
  return (
    <PhoneFrame>
      <RouterProvider router={router} />
    </PhoneFrame>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}