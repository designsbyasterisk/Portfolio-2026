import { NavLink, Outlet } from "react-router-dom";
import { Home, Calendar, BarChart3, Sparkles, User, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/log", label: "Log", icon: Calendar },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/toolkit", label: "Toolkit", icon: Sparkles },
  { to: "/profile", label: "You", icon: User },
];

export default function AppShell() {
  const isIframe = typeof window !== "undefined" && window.self !== window.top;

  const content = (
    <>
      <div id="mobile-overlay-root" className="absolute inset-0 z-50 pointer-events-none"></div>
      <div className="absolute inset-0 noise-overlay opacity-30 pointer-events-none mix-blend-overlay"></div>
      
      {/* Scrollable Area */}
      <div className="relative z-10 flex-1 overflow-y-auto hide-scrollbar flex flex-col">
        <header className="px-5 pt-12 pb-4 flex items-center gap-2 shrink-0">
          <Flame className="h-6 w-6 text-slate-800" />
          <span className="font-bold tracking-tight text-lg font-quicksand uppercase text-slate-900 drop-shadow-sm">Ember</span>
        </header>
        <main className="px-5 pb-32 flex-1">
          <Outlet />
        </main>
      </div>

      {/* Fixed Nav inside container */}
      <nav className="absolute bottom-0 inset-x-0 glass z-40 border-x-0 border-b-0 rounded-none pb-8 pt-4 bg-white/40 border-t-white/60">
        <div className="grid grid-cols-5 px-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center gap-1 py-2 text-[10px] font-semibold transition-all duration-300 press-scale",
                  isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-800",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "h-6 w-6 transition-transform duration-300",
                      isActive && "drop-shadow-md scale-110",
                    )}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );

  if (isIframe) {
    return (
      <div className="relative w-full h-full bg-app-bg overflow-hidden flex flex-col">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 overflow-hidden">
      <div className="relative w-[393px] h-[852px] bg-app-bg rounded-[3rem] border-[12px] border-black shadow-[0_0_80px_rgba(42,107,204,0.15)] overflow-hidden shrink-0 flex flex-col transform">
        {content}
      </div>
    </div>
  );
}
