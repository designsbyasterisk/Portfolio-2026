import { create } from "zustand";
import { replay, REPLAY_DURATION, drivers, type CarFrame, FPS } from "@/data/f1Mock";

interface ReplayState {
  time: number;
  isPlaying: boolean;
  speed: number;
  focusedDriverId: string;
  viewMode: "replay" | "spatial" | "telemetry" | "comparison" | "incidents";
  telemetryOpacity: number;
  selectedDriver: string;
  comparisonDriver: string | null;
  activeTrack: string;
  activeRace: string;
  selectedIncident: Record<string, unknown> | null;
  selectedZone: string | null;
  
  setTime: (t: number) => void;
  togglePlay: () => void;
  setSpeed: (s: number) => void;
  setFocus: (id: string) => void;
  setViewMode: (mode: "replay" | "spatial" | "telemetry" | "comparison" | "incidents") => void;
  setTelemetryOpacity: (opacity: number) => void;
  setSelectedDriver: (driver: string) => void;
  setComparisonDriver: (driver: string | null) => void;
  setActiveTrack: (track: string) => void;
  setActiveRace: (race: string) => void;
  setSelectedIncident: (incident: Record<string, unknown> | null) => void;
  setSelectedZone: (zone: string | null) => void;
  tick: (dt: number) => void;
}

export const useReplay = create<ReplayState>((set, get) => ({
  time: 0,
  isPlaying: true,
  speed: 1,
  focusedDriverId: drivers[0].id,
  viewMode: "replay",
  telemetryOpacity: 80,
  selectedDriver: "Leclerc",
  comparisonDriver: null,
  activeTrack: "monaco",
  activeRace: "monaco_2024",
  selectedIncident: null,
  selectedZone: null,
  
  setTime: (t) => set({ time: Math.max(0, Math.min(REPLAY_DURATION, t)) }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setSpeed: (s) => set({ speed: s }),
  setFocus: (id) => set((state) => {
    const matched = drivers.find((d) => d.id === id);
    return {
      focusedDriverId: id,
      selectedDriver: matched ? matched.name.split(" ").pop() ?? state.selectedDriver : state.selectedDriver,
    };
  }),
  setViewMode: (mode) => set({ viewMode: mode, selectedZone: null, selectedIncident: null }),
  setTelemetryOpacity: (opacity) => set({ telemetryOpacity: opacity }),
  setSelectedDriver: (driver) => set((state) => {
    const matched = drivers.find((d) => d.name.toLowerCase().includes(driver.toLowerCase()) || d.id === driver.toLowerCase());
    return {
      selectedDriver: driver,
      focusedDriverId: matched ? matched.id : state.focusedDriverId,
    };
  }),
  setComparisonDriver: (driver) => set({ comparisonDriver: driver }),
  setActiveTrack: (track) => set({ activeTrack: track }),
  setActiveRace: (race) => set({ activeRace: race }),
  setSelectedIncident: (incident) => set({ selectedIncident: incident }),
  setSelectedZone: (zone) => set({ selectedZone: zone }),
  tick: (dt) => {
    const { isPlaying, speed, time, viewMode } = get();
    if (!isPlaying || (viewMode !== "replay" && viewMode !== "telemetry" && viewMode !== "comparison")) return;
    const next = time + dt * speed;
    set({ time: next >= REPLAY_DURATION ? 0 : next });
  },
}));

export function getFrameAt(time: number) {
  const idx = Math.min(replay.length - 1, Math.max(0, Math.floor(time * FPS)));
  return replay[idx];
}

export function getCarFrame(time: number, driverId: string): CarFrame | undefined {
  return getFrameAt(time).cars.find((c) => c.driverId === driverId);
}

export { REPLAY_DURATION };
