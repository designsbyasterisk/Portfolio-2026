import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Home from "./pages/Home.tsx";
import Log from "./pages/Log.tsx";
import Insights from "./pages/Insights.tsx";
import Toolkit from "./pages/Toolkit.tsx";
import Profile from "./pages/Profile.tsx";
import AppShell from "./components/AppShell.tsx";
import { useAppState } from "./lib/useAppState";

const queryClient = new QueryClient();

function ProtectedShell() {
  const { state } = useAppState();
  if (!state.onboardedAt) return <Navigate to="/welcome" replace />;
  return <AppShell />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/welcome" element={<Onboarding />} />
          <Route element={<ProtectedShell />}>
            <Route path="/home" element={<Home />} />
            <Route path="/log" element={<Log />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/toolkit" element={<Toolkit />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
