// Polyfill for react-draggable/react-grid-layout in Vite
if (typeof window !== "undefined") {
  (window as any).process = { env: { NODE_ENV: "development" } };
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

createRoot(document.getElementById("root")!).render(<App />);
