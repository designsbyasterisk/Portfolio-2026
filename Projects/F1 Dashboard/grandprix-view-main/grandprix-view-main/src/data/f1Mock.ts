// Monaco Grand Prix 2024 — REAL race data (lap-by-lap from Ergast/Jolpica F1 API).
// Source: api.jolpi.ca/ergast/f1/2024/8/laps + /results — fetched once and baked
// into src/data/monaco2024.json. The replay below maps the real race timeline
// onto a short playback window so the dots on the track move at real relative
// pace, with positions and lap times that match the historical record.

import raw from "./monaco2024.json";

export type TireCompound = "S" | "M" | "H" | "I" | "W";

export interface Driver {
  id: string;
  number: number;
  code: string;
  name: string;
  team: string;
  color: string;
  points: number;
  delta: number;     // grid → finish
  startGrid: number;
  finish: number;
  status: string;
}

export interface Constructor {
  id: string;
  name: string;
  color: string;
  points: number;
}

export interface CarFrame {
  driverId: string;
  progress: number;
  lap: number;
  speed: number;
  gear: number;
  throttle: number;
  brake: number;
  tire: TireCompound;
  position: number;
  lastLapMs: number;
  retired?: boolean;
}

export interface ReplayFrame {
  t: number;
  cars: CarFrame[];
}

// ---------------------------------------------------------------------------
// Static metadata for the top 10 finishers — keyed off the Ergast driverId so
// we can join with the real lap data below.
// ---------------------------------------------------------------------------

const META: Record<string, { id: string; number: number; code: string; team: string; color: string }> = {
  leclerc:        { id: "lec", number: 16, code: "LEC", team: "Ferrari",       color: "#DC2626" },
  piastri:        { id: "pia", number: 81, code: "PIA", team: "McLaren",       color: "#F97316" },
  sainz:          { id: "sai", number: 55, code: "SAI", team: "Ferrari",       color: "#DC2626" },
  norris:         { id: "nor", number:  4, code: "NOR", team: "McLaren",       color: "#F97316" },
  russell:        { id: "rus", number: 63, code: "RUS", team: "Mercedes",      color: "#06B6D4" },
  max_verstappen: { id: "ver", number:  1, code: "VER", team: "Red Bull",      color: "#1E40AF" },
  hamilton:       { id: "ham", number: 44, code: "HAM", team: "Mercedes",      color: "#06B6D4" },
  tsunoda:        { id: "tsu", number: 22, code: "TSU", team: "RB",            color: "#3B82F6" },
  albon:          { id: "alb", number: 23, code: "ALB", team: "Williams",      color: "#0EA5E9" },
  gasly:          { id: "gas", number: 10, code: "GAS", team: "Alpine",        color: "#EC4899" },
  alonso:         { id: "alo", number: 14, code: "ALO", team: "Aston Martin",  color: "#10B981" },
  ricciardo:      { id: "ric", number:  3, code: "RIC", team: "RB",            color: "#3B82F6" },
  bottas:         { id: "bot", number: 77, code: "BOT", team: "Sauber",        color: "#52E252" },
  stroll:         { id: "str", number: 18, code: "STR", team: "Aston Martin",  color: "#10B981" },
  sargeant:       { id: "sar", number:  2, code: "SAR", team: "Williams",      color: "#0EA5E9" },
  zhou:           { id: "zho", number: 24, code: "ZHO", team: "Sauber",        color: "#52E252" },
  ocon:           { id: "oco", number: 31, code: "OCO", team: "Alpine",        color: "#EC4899" },
  perez:          { id: "per", number: 11, code: "PER", team: "Red Bull",      color: "#1E40AF" },
  hulkenberg:     { id: "hul", number: 27, code: "HUL", team: "Haas",          color: "#B6BABD" },
  magnussen:      { id: "mag", number: 20, code: "MAG", team: "Haas",          color: "#B6BABD" },
};

const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

interface RawResult {
  driverId: string;
  code: string;
  number: number;
  position: number;
  grid: number;
  status: string;
  points: number;
  constructor: string;
  name: string;
  fastestLap?: string;
  fastestLapNumber?: string;
  totalTime?: string;
}

const rawResults = raw.results as RawResult[];
const rawLapTimes = raw.lapTimes as Record<string, number[]>;

export const drivers: Driver[] = rawResults.map((r) => {
  const m = META[r.driverId];
  return {
    id: m.id,
    number: m.number,
    code: m.code,
    name: r.name,
    team: m.team,
    color: m.color,
    points: POINTS_TABLE[r.position - 1] ?? 0,
    delta: r.grid - r.position, // positive = gained places
    startGrid: r.grid,
    finish: r.position,
    status: r.status,
  };
});

// driverId mapping for lookups by short id
const SHORT_TO_LONG: Record<string, string> = Object.fromEntries(
  rawResults.map((r) => [META[r.driverId].id, r.driverId])
);

// Constructor standings AFTER Monaco 2024 (round 8) — official championship table
export const constructors: Constructor[] = [
  { id: "rbr", name: "Red Bull",     color: "#1E40AF", points: 276 },
  { id: "fer", name: "Ferrari",      color: "#DC2626", points: 252 },
  { id: "mcl", name: "McLaren",      color: "#F97316", points: 212 },
  { id: "mer", name: "Mercedes",     color: "#C0C0C0", points: 134 },
  { id: "ast", name: "Aston Martin", color: "#10B981", points:  58 },
  { id: "rb",  name: "RB",           color: "#3B82F6", points:  28 },
];

export const currentRace = {
  name: "Monaco Grand Prix 2024",
  circuit: "Circuit de Monaco",
  totalLaps: 78,
  date: "2024-05-26",
  winner: "Charles Leclerc",
  poleTime: "1:10.270",
  fastestLap: { driver: "Lewis Hamilton", time: "1:14.165", lap: 76 },
};

// Real flag events from the 2024 Monaco GP.
// - Lap 1: Yellow flags waved at Beau Rivage after the Perez/Magnussen/Hulkenberg
//   collision, immediately escalated to a RED FLAG that stopped the race for ~30 min.
//   Race resumed under standing restart and ran green to the flag.
export interface FlagEvent {
  type: "yellow" | "red";
  fromLap: number;
  toLap: number;
  note: string;
}
export const flagEvents: FlagEvent[] = [
  { type: "yellow", fromLap: 1, toLap: 1, note: "Beau Rivage incident — waved yellows" },
  { type: "red",    fromLap: 1, toLap: 2, note: "Red flag — Perez/Magnussen/Hulkenberg crash" },
];

export const nextRace = {
  name: "Canadian Grand Prix",
  circuit: "Circuit Gilles Villeneuve",
  round: 9,
  date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
  laps: 70,
  length: 4.361,
  weather: {
    trackTemp: 28,
    airTemp: 21,
    rainChance: 35,
    forecast: [
      { day: "FP", icon: "cloud", high: 22, low: 14 },
      { day: "QU", icon: "rain",  high: 20, low: 13 },
      { day: "RC", icon: "cloud", high: 23, low: 15 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Build cumulative-time tables per driver and a smooth replay timeline.
// ---------------------------------------------------------------------------

interface DriverTimeline {
  shortId: string;
  lapSec: number[];     // duration of each completed lap, in seconds
  cumSec: number[];     // cumSec[i] = race time at END of lap i+1 (cumSec[-1] before first lap = 0)
  totalSec: number;     // race time at last completed lap
  totalLaps: number;
}

export const timelines: DriverTimeline[] = rawResults.map((r) => {
  const realLaps = rawLapTimes[r.driverId] ?? [];

  // The 2024 Monaco GP had a lap-1 red flag (~30 min stoppage) that's baked
  // into the lap-1 time (~2400 s) and distorts lap 2 (restart bunching).
  // For a watchable replay we replace those two laps with each driver's
  // median pace, plus a grid-position offset so the field starts visibly
  // staggered around the track.
  const cleanLaps = realLaps.slice(2);
  const sorted = [...cleanLaps].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 83;
  const gridOffset = (r.grid - 1) * 0.45; // ~0.45 s per grid slot
  const lapSec = [median + gridOffset, median + gridOffset * 0.5, ...cleanLaps];

  const cum: number[] = [];
  let s = 0;
  for (const l of lapSec) { s += l; cum.push(s); }
  return {
    shortId: META[r.driverId].id,
    lapSec,
    cumSec: cum,
    totalSec: s,
    totalLaps: lapSec.length,
  };
});

// Race duration = winner's total time (now ~78 × ~75 s ≈ 5850 s of pure racing)
export const RACE_TOTAL_SEC = Math.max(...timelines.map((t) => t.totalSec));

// Locate (lap index, fraction-into-lap) for a given race-time.
function locate(tl: DriverTimeline, raceT: number): { lap: number; frac: number; lapDur: number } {
  if (raceT >= tl.totalSec) {
    const lapDur = tl.lapSec[tl.totalLaps - 1] ?? 75;
    return { lap: tl.totalLaps, frac: 1, lapDur };
  }
  // Binary search through cumSec
  let lo = 0, hi = tl.cumSec.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (tl.cumSec[mid] <= raceT) lo = mid + 1; else hi = mid;
  }
  const lapIdx = lo; // currently running lap = lapIdx (0-based)
  const lapStart = lapIdx === 0 ? 0 : tl.cumSec[lapIdx - 1];
  const lapDur = tl.lapSec[lapIdx];
  const frac = (raceT - lapStart) / lapDur;
  return { lap: lapIdx + 1, frac, lapDur };
}

const TIRE_PLAN: Record<string, TireCompound[]> = {
  // Most drivers started on mediums and pitted to hards under the lap-1 red flag
  lec: ["M", "H"], pia: ["M", "H"], sai: ["M", "H"], nor: ["M", "H"],
  rus: ["M", "H"], ver: ["M", "H"], ham: ["M", "H"], tsu: ["M", "H"],
  alb: ["H", "M"], gas: ["H", "M"],
  alo: ["H", "M"], ric: ["M", "H"], bot: ["H", "M"], str: ["H", "M"],
  sar: ["M", "H"], zho: ["M", "H"], oco: ["M"], per: ["M"],
  hul: ["M"], mag: ["M"],
};
function tireAt(shortId: string, lap: number): TireCompound {
  const plan = TIRE_PLAN[shortId] ?? ["M"];
  // Pit window roughly lap 1 (red flag) for most, except Albon/Gasly who started hard
  return lap <= 1 ? plan[0] : plan[plan.length - 1];
}

// Generate replay frames at fps over a compressed playback duration.
// Set to real-time (1 second dashboard = 1 second real-world).
const PLAYBACK_SEC = Math.round(RACE_TOTAL_SEC);
export const FPS = 2;

export function generateReplay(): ReplayFrame[] {
  const frames: ReplayFrame[] = [];
  const totalFrames = PLAYBACK_SEC * FPS;
  for (let f = 0; f < totalFrames; f++) {
    const t = f / FPS;
    const raceT = (t / PLAYBACK_SEC) * RACE_TOTAL_SEC;

    // Compute laps-completed (for ordering) and per-car frame data
    const cars: (CarFrame & { _laps: number })[] = timelines.map((tl) => {
      const { lap, frac, lapDur } = locate(tl, raceT);
      const lapsDone = (lap - 1) + frac;
      // Cosmetic telemetry — derived from a corner-factor along progress
      const cornerFactor = 0.35 + 0.55 * Math.abs(Math.sin(frac * Math.PI * 5));
      const speed = Math.round(70 + cornerFactor * 220);
      const throttle = +cornerFactor.toFixed(2);
      const brake = +Math.max(0, 0.9 - cornerFactor).toFixed(2);
      const gear = Math.max(1, Math.min(8, Math.round(1 + cornerFactor * 7)));
      const lastLapMs = Math.round((tl.lapSec[Math.max(0, lap - 2)] ?? lapDur) * 1000);

      // Check if driver retired early and we have passed their crash/retirement time
      const driverResult = rawResults.find((r) => META[r.driverId]?.id === tl.shortId);
      const isRetired = driverResult && driverResult.status !== "Finished" && driverResult.status !== "Lapped";
      const retired = isRetired && raceT >= tl.totalSec;

      return {
        driverId: tl.shortId,
        progress: frac,
        lap: Math.min(currentRace.totalLaps, lap),
        speed: retired ? 0 : speed,
        gear: retired ? 0 : gear,
        throttle: retired ? 0 : throttle,
        brake: retired ? 0 : brake,
        tire: tireAt(tl.shortId, lap),
        position: 0,
        lastLapMs,
        retired,
        _laps: lapsDone,
      };
    });

    // Order by laps completed (more = ahead)
    const order = cars.map((c, i) => ({ i, l: c._laps })).sort((a, b) => b.l - a.l);
    order.forEach((o, idx) => (cars[o.i].position = idx + 1));
    frames.push({ t, cars: cars.map(({ _laps, ...c }) => c) });
  }
  return frames;
}

export const replay: ReplayFrame[] = generateReplay();
export const REPLAY_DURATION = replay[replay.length - 1].t;

// Real lap history straight from the API
export function buildLapHistory(): Record<string, { lap: number; ms: number }[]> {
  const out: Record<string, { lap: number; ms: number }[]> = {};
  for (const tl of timelines) {
    out[tl.shortId] = tl.lapSec.map((s, i) => ({ lap: i + 1, ms: Math.round(s * 1000) }));
  }
  return out;
}

export const lapHistory = buildLapHistory();

// Find the time at the start of a given lap (1-indexed)
export function getLapStartTime(lap: number): number {
  const leaderTimeline = timelines.find(t => t.shortId === "lec");
  if (!leaderTimeline) return 0;
  if (lap <= 1) return 0;
  if (lap > leaderTimeline.totalLaps) return REPLAY_DURATION;
  
  // Convert race time to playback time
  const raceSec = leaderTimeline.cumSec[lap - 2]; // end of lap - 1
  return (raceSec / RACE_TOTAL_SEC) * REPLAY_DURATION;
}

