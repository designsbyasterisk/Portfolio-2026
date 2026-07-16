import { Suspense, lazy, useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings2, 
  Trophy, 
  Map, 
  AlertTriangle, 
  SlidersHorizontal,
  Table,
  X,
  Gauge,
  HelpCircle
} from "lucide-react";
import { currentRace, nextRace, flagEvents, RACE_TOTAL_SEC } from "@/data/f1Mock";
import monacoRaceData from "@/data/monaco_race.json";
import f1Logo from "@/data/f1-logo.png";
import { useReplay, getFrameAt, REPLAY_DURATION } from "@/hooks/useReplay";
import { keys } from "@/lib/layout.helper";
import OnboardingTour from "@/components/OnboardingTour";
import Track3D from "@/components/track/Track3D";
import PlaybackBar from "@/components/PlaybackBar";
import Telemetry from "@/components/panels/Telemetry";
import DriverHeadToHead from "@/components/panels/DriverHeadToHead";

const DRIVERS = [
  "Leclerc", "Piastri", "Sainz", "Norris", "Russell", "Verstappen", "Hamilton", "Tsunoda", "Albon", "Gasly",
  "Alonso", "Ricciardo", "Bottas", "Stroll", "Sargeant", "Zhou", "Ocon", "Hulkenberg", "Perez", "Magnussen"
];

const TEAM_COLORS: Record<string, string> = {
  Ferrari: "#DC2626",
  McLaren: "#F97316",
  Mercedes: "#06B6D4",
  "Red Bull Racing": "#1E40AF",
  "Red Bull": "#1E40AF",
  "Aston Martin": "#10B981",
  Alpine: "#EC4899",
  RB: "#3B82F6",
  Williams: "#0EA5E9",
  Haas: "#B6BABD",
  Sauber: "#52E252",
  "Kick Sauber": "#52E252"
};

const TRACKS = [
  { id: "monaco", name: "Monaco", country: "🇲🇨", city: "Monte Carlo" },
  { id: "silverstone", name: "Silverstone (Locked)", country: "🇬🇧", city: "Great Britain" },
  { id: "monza", name: "Monza (Locked)", country: "🇮🇹", city: "Italy" },
];

const RACES: Record<string, { id: string; label: string }[]> = {
  monaco: [
    { id: "monaco_2024", label: "Monaco GP 2024" },
    { id: "monaco_2023", label: "Monaco GP 2023 (Locked)" }
  ],
  silverstone: [],
  monza: []
};

interface RaceResults {
  weather: string;
  temp: number;
  pole: string;
  results: {
    pos: number | string;
    driver: string;
    team: string;
    gap: string | null;
    bestLap: string | null;
    status: string;
  }[];
  circuit: {
    name: string;
    location: string;
    length: number;
    turns: number;
    drsZones: number;
    type: string;
    lapRecord: string;
    lapRecordHolder: string;
    overtakingIndex: string;
  };
}

import Layout from "@/components/Layout";

const CARD_LABELS: Record<string, string> = {
  liveOrder: "Live Standings Board",
  driversChampionship: "Championship Standings",
  constructorsChampionship: "Constructors Standing",
  lapTiming: "Lap Timing Chart",
  liveReplay: "3D Viewport & Replay",
  circuitSpecs: "Circuit Specs",
  raceSummary: "Race Summary",
  telemetry: "Telemetry Gauges & Dials",
  raceControlTicker: "Race Control Ticker",
  pitStopStrategy: "Pit Stop & Tyre",
  driverHeadToHead: "Driver Battle",
  teamComparison: "Teammate Battle Chart"
};

export default function Index() {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const widgetParam = queryParams.get("widget") || hashParams.get("widget");

  const {
    time,
    viewMode,
    setViewMode,
    telemetryOpacity,
    setTelemetryOpacity,
    selectedDriver,
    setSelectedDriver,
    comparisonDriver,
    setComparisonDriver,
    activeTrack,
    setActiveTrack,
    activeRace,
    setActiveRace,
    selectedIncident,
    setSelectedIncident
  } = useReplay();

  const [activeCards, setActiveCards] = useState<string[]>(() =>
    keys.filter((key) => key !== "constructorsChampionship" && key !== "driversChampionship")
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Auto-trigger tour after 1.5 seconds if they haven't seen it
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("f1_dashboard_tour_seen");
    if (!hasSeenTour && !widgetParam) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
        localStorage.setItem("f1_dashboard_tour_seen", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [widgetParam]);

  // Tick timer if rendering a standalone widget without Track3D
  useEffect(() => {
    if (!widgetParam || widgetParam === "liveReplay") return;
    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      useReplay.getState().tick(dt);
    }, 16);
    return () => clearInterval(interval);
  }, [widgetParam]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentFrame = getFrameAt(time);
  const leaderCar = currentFrame?.cars?.find((c) => c.position === 1);
  const currentLap = leaderCar ? leaderCar.lap : 1;
  const isRedFlag = flagEvents.some(
    (f) => f.type === "red" && currentLap >= f.fromLap && currentLap <= f.toLap
  );

  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState<"circuit" | "standings">("standings");
  const [raceResults, setRaceResults] = useState<RaceResults | null>(monacoRaceData as unknown as RaceResults);

  useEffect(() => {
    // Loaded statically via import to work in local standalone HTML files
  }, []);

  const grid = raceResults?.results || [];

  // Format date: "26 MAY 2024"
  const d = new Date(currentRace.date);
  const formattedDate = `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${d.getFullYear()}`;

  // Format track time starting at 15:00:00 local time
  const elapsedSec = (time / REPLAY_DURATION) * RACE_TOTAL_SEC;
  const totalSeconds = 15 * 3600 + elapsedSec; // 15:00:00 start time
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  const formattedTrackTime = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Render standalone widget if requested
  if (widgetParam) {
    let componentToRender = null;
    switch (widgetParam) {
      case "liveReplay":
        componentToRender = (
          <div className="h-screen w-screen bg-[#030303] text-white flex flex-col justify-between overflow-hidden relative p-2">
            <div className="flex-1 min-h-0 relative rounded-[10px] border border-white/5 overflow-hidden">
              <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs font-mono">LOADING 3D CANVAS...</div>}>
                <Track3D />
              </Suspense>
            </div>
            <div className="shrink-0 mt-2 bg-[#09090b] border border-white/5 rounded-[10px] overflow-hidden">
              <PlaybackBar />
            </div>
          </div>
        );
        break;
      case "telemetry":
        componentToRender = (
          <div className="h-screen w-screen bg-[#030303] text-white p-2 overflow-hidden select-none flex items-center justify-center">
            <div className="w-full h-full bg-[#09090b] border border-white/5 rounded-[10px] p-4 flex flex-col justify-center overflow-hidden relative">
              <Telemetry />
            </div>
          </div>
        );
        break;
      case "driverHeadToHead":
        componentToRender = (
          <div className="h-screen w-screen bg-[#030303] text-white p-2 overflow-hidden select-none flex items-center justify-center">
            <div className="w-full h-full bg-[#09090b] border border-white/5 rounded-[10px] p-4 flex flex-col justify-between overflow-hidden relative">
              <DriverHeadToHead />
            </div>
          </div>
        );
        break;
      default:
        componentToRender = <div className="text-white p-4 font-mono">Widget not found</div>;
    }
    return (
      <main className="h-screen w-screen bg-[#030303] text-foreground font-sans overflow-hidden">
        {componentToRender}
      </main>
    );
  }

  return (

    <main className="h-screen w-screen bg-[#030303] text-foreground font-sans overflow-hidden flex flex-col">
      {/* HEADER */}
      <header className="h-[60px] shrink-0 flex items-center justify-between px-6 bg-card border-b border-border/40 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-[10px] tracking-widest uppercase font-semibold text-muted-foreground">
            <span className="bg-white/10 text-white px-2.5 py-1 rounded-sm">{currentRace.name}</span>
            <span>Round <span className="text-white mono">{nextRace.round - 1}</span></span>
          </div>
        </div>


        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <img src={f1Logo} alt="F1 Logo" className="h-6 object-contain" />
        </div>

        {/* Right Section: Date & Track Time */}
        <div className="flex items-center gap-6 text-[10px] tracking-widest uppercase font-semibold text-muted-foreground">
          {/* Onboarding Help Button */}
          <button
            onClick={() => setIsTourOpen(true)}
            className="flex items-center gap-1.5 bg-[#121212]/95 border border-white/10 hover:border-primary/60 hover:text-white px-2.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-widest text-muted-foreground transition-all shadow-md select-none pointer-events-auto"
            title="Open Onboarding Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            Guide
          </button>

          {/* Dropdown Checkbox Panel */}
          <div className="relative pointer-events-auto" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-[#121212]/95 border border-white/10 hover:border-primary/60 px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-widest text-white transition-all shadow-md select-none"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
              Widgets ({activeCards.length})
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 z-50 w-64 bg-[#121212]/95 border border-white/10 p-3 rounded-md shadow-2xl backdrop-blur-md text-left normal-case">
                <div className="text-[9px] font-semibold text-white/50 uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-1">
                  Grid Selection (3-10 Widgets)
                </div>
                <div className="flex flex-col space-y-1 max-h-64 overflow-y-auto scrollbar-none pr-1">
                  {keys.map((key) => {
                    const isChecked = activeCards.includes(key);
                    const isDisabled = (isChecked && activeCards.length <= 3) || (!isChecked && activeCards.length >= 10);
                    return (
                      <label 
                        key={key} 
                        className={`flex items-center gap-2.5 p-1 rounded cursor-pointer transition-colors ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white/5"}`}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => {
                            if (isChecked) {
                              if (activeCards.length > 3) {
                                setActiveCards(activeCards.filter(k => k !== key));
                              }
                            } else {
                              if (activeCards.length < 10) {
                                setActiveCards([...activeCards, key]);
                              }
                            }
                          }}
                          className="accent-primary w-3.5 h-3.5 rounded cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="text-[10px] text-white/90 font-bold uppercase tracking-wider select-none truncate">
                          {CARD_LABELS[key]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end border-l border-white/10 pl-5">
            <span className="text-white/40 text-[8px] tracking-[0.2em] uppercase font-semibold leading-none mb-1">Race Date</span>
            <span className="text-white font-bold font-mono text-[11px]">{formattedDate}</span>
          </div>
          <div className="flex flex-col items-end border-l border-white/10 pl-5">
            <span className="text-white/40 text-[8px] tracking-[0.2em] uppercase font-semibold leading-none mb-1">Track Time (CEST)</span>
            <span className="text-primary font-semibold font-mono text-[11px] tracking-wider">{formattedTrackTime}</span>
          </div>
        </div>
      </header>
       <div className="flex-1 min-h-0 bg-[#030303] overflow-hidden">
        <Layout 
          viewMode={viewMode}
          setViewMode={setViewMode}
          telemetryOpacity={telemetryOpacity}
          setTelemetryOpacity={setTelemetryOpacity}
          selectedDriver={selectedDriver}
          setSelectedDriver={setSelectedDriver}
          comparisonDriver={comparisonDriver}
          setComparisonDriver={setComparisonDriver}
          selectedIncident={selectedIncident}
          setSelectedIncident={setSelectedIncident}
          raceResults={raceResults}
          grid={grid}
          DRIVERS={DRIVERS}
          activeCards={activeCards}
        />
      </div>
      <OnboardingTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </main>
  );
}
