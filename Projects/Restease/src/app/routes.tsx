import { createHashRouter, Outlet, Navigate } from "react-router";
import { StatusBar } from "./components/app/StatusBar";
import { BottomTabBar } from "./components/app/BottomTabBar";
import { InitScreen } from "./screens/InitScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { SOSScreen } from "./screens/SOSScreen";
import { IncidentScreen } from "./screens/IncidentScreen";
import { InventoryScreen } from "./screens/InventoryScreen";
import { LogsScreen } from "./screens/LogsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { useApp } from "./context/AppContext";

function Root() {
  const { theme: t } = useApp();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: t.bg,
        overflow: "hidden",
        transition: "background-color 0.3s",
      }}
    >
      <Outlet />
    </div>
  );
}

function AppShell() {
  const { hasActiveSOS } = useApp();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <StatusBar sosActive={hasActiveSOS} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  );
}

export const router = createHashRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: InitScreen },
      {
        path: "app",
        Component: AppShell,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          { path: "dashboard", Component: DashboardScreen },
          { path: "sos", Component: SOSScreen },
          { path: "sos/:unitId", Component: IncidentScreen },
          { path: "inventory", Component: InventoryScreen },
          { path: "logs", Component: LogsScreen },
          { path: "settings", Component: SettingsScreen },
        ],
      },
    ],
  },
]);