import type { AppState, Motivation } from "../types";
import type { DailySummary } from "../analytics";
import {
  CO2_GRAMS_PER_CIG,
  WATER_LITERS_PER_CIG,
  MINUTES_PER_CIG,
  MOVIE_RUNTIMES_MIN,
  MONEY_COMPARISONS,
  CO2_COMPARISONS,
  pickScale,
  CRAVING_PEAK_MIN,
  BUTT_LITTER_FRAC,
} from "./constants";

export interface NarrationContext {
  state: AppState;
  summary: DailySummary;
  surface: "home_story" | "stat_money" | "stat_streak" | "stat_health" | "stat_cravings" | "celebration" | "slip" | "insight";
}

export interface Narration {
  id: string;
  text: string;
  source?: string;
  category: "projection" | "scale" | "body" | "world" | "warm";
  motivationTags: Motivation[];
}

type Template = {
  id: string;
  category: Narration["category"];
  motivationTags: Motivation[];
  surfaces: NarrationContext["surface"][];
  // Returns null if not applicable for this state
  render: (ctx: NarrationContext) => Omit<Narration, "id" | "category" | "motivationTags"> | null;
};

const fmtMoney = (n: number, currency = "₹") => `${currency}${n.toFixed(n < 10 ? 2 : 0)}`;
const fmtMin = (m: number) => (m >= 60 ? `${(m / 60).toFixed(1)}h` : `${Math.round(m)} min`);

export const TEMPLATES: Template[] = [
  // PROJECTIONS — extrapolate today's behavior
  {
    id: "proj_co2_year",
    category: "projection",
    motivationTags: ["health", "freedom"],
    surfaces: ["home_story", "celebration"],
    render: ({ summary }) => {
      if (summary.cigsAvoidedToday < 1) return null;
      const yearlyKg = (summary.cigsAvoidedToday * CO2_GRAMS_PER_CIG * 365) / 1000;
      const cmp = pickScale(CO2_COMPARISONS, yearlyKg);
      return {
        text: `You smoked ${summary.cigsAvoidedToday} fewer today. Keep that pace for a year and you'll spare the air ${yearlyKg.toFixed(0)} kg of CO₂ — about ${cmp.label}.`,
        source: "WHO/IPCC tobacco lifecycle estimates",
      };
    },
  },
  {
    id: "proj_money_year",
    category: "projection",
    motivationTags: ["money", "family"],
    surfaces: ["home_story", "stat_money"],
    render: ({ summary, state }) => {
      if (summary.cigsAvoidedToday < 1) return null;
      const yearly = (summary.cigsAvoidedToday / summary.cigsPerPack) * summary.pricePerPack * 365;
      if (yearly < 1) return null;
      const cmp = pickScale(MONEY_COMPARISONS, yearly);
      return {
        text: `At today's pace, you'll save ${fmtMoney(yearly, state.profile.currency)} this year — that's ${cmp.label}.`,
      };
    },
  },
  {
    id: "proj_water_month",
    category: "projection",
    motivationTags: ["health", "family"],
    surfaces: ["home_story"],
    render: ({ summary }) => {
      if (summary.cigsAvoidedToday < 2) return null;
      const liters = summary.cigsAvoidedToday * WATER_LITERS_PER_CIG * 30;
      return {
        text: `Tobacco is thirsty. The cigarettes you skipped today, repeated for a month, save ~${liters.toFixed(0)} liters of water — over ${Math.round(liters / 1.5)} water bottles.`,
        source: "Tobacco production water footprint estimates",
      };
    },
  },

  // SCALE — translate raw numbers into pictures
  {
    id: "scale_money_total",
    category: "scale",
    motivationTags: ["money"],
    surfaces: ["stat_money", "home_story"],
    render: ({ summary, state }) => {
      if (summary.moneySavedTotal < 1) return null;
      const cmp = pickScale(MONEY_COMPARISONS, summary.moneySavedTotal);
      return {
        text: `${fmtMoney(summary.moneySavedTotal, state.profile.currency)} saved so far — that's ${cmp.label}.`,
      };
    },
  },
  {
    id: "scale_cravings_time",
    category: "scale",
    motivationTags: ["control", "freedom"],
    surfaces: ["stat_cravings", "home_story"],
    render: ({ summary }) => {
      const beats = summary.cravingsBeatenToday;
      if (beats < 1) return null;
      const min = beats * CRAVING_PEAK_MIN;
      return {
        text: `You out-waited ${beats} craving${beats === 1 ? "" : "s"} today — about ${fmtMin(min)} of urge surfing. Each one peaks in 4 minutes and fades.`,
      };
    },
  },
  {
    id: "scale_break_time_movie",
    category: "scale",
    motivationTags: ["freedom", "fitness"],
    surfaces: ["home_story", "insight"],
    render: ({ summary }) => {
      if (summary.totalCigsAvoided < 5) return null;
      const minutes = summary.totalCigsAvoided * MINUTES_PER_CIG;
      const movie = MOVIE_RUNTIMES_MIN.reduce((acc, m) => (m.min <= minutes ? m : acc), MOVIE_RUNTIMES_MIN[0]);
      return {
        text: `Smoke breaks add up. You've reclaimed ~${fmtMin(minutes)} of life so far — long enough to watch ${movie.title}.`,
      };
    },
  },
  {
    id: "scale_avg_smoker_year",
    category: "scale",
    motivationTags: ["freedom", "control"],
    surfaces: ["insight", "home_story"],
    render: () => ({
      text: `The average pack-a-day smoker spends ~120 minutes a day on smoke breaks — that's a feature film every single day, or 30 full days a year.`,
    }),
  },

  // BODY & WORLD WINS
  {
    id: "body_72h",
    category: "body",
    motivationTags: ["health", "fitness"],
    surfaces: ["home_story", "stat_health"],
    render: ({ summary }) => {
      if (summary.streakDays < 3) return null;
      return {
        text: `Three days in. Your bronchial tubes are relaxing — breathing right now is like switching from a clogged straw to an open one.`,
        source: "American Lung Association",
      };
    },
  },
  {
    id: "body_2wk",
    category: "body",
    motivationTags: ["fitness", "health"],
    surfaces: ["home_story", "stat_health"],
    render: ({ summary }) => {
      if (summary.streakDays < 14) return null;
      return {
        text: `Two weeks under cap. Circulation is rebooting — that flight of stairs you dreaded? Easier now.`,
      };
    },
  },
  {
    id: "world_butts",
    category: "world",
    motivationTags: ["family", "freedom"],
    surfaces: ["home_story", "insight"],
    render: ({ summary }) => {
      if (summary.totalCigsAvoided < 20) return null;
      const littered = Math.round(summary.totalCigsAvoided * BUTT_LITTER_FRAC);
      return {
        text: `${littered} cigarette butts not in oceans, parks, or sidewalks. Butts are the #1 ocean litter item — you're literally cleaner.`,
        source: "Ocean Conservancy",
      };
    },
  },

  // WARM REFRAMES
  {
    id: "warm_first_day",
    category: "warm",
    motivationTags: ["control"],
    surfaces: ["home_story"],
    render: ({ summary }) => {
      if (summary.daysSinceStart > 0) return null;
      return {
        text: `Day one. The hardest day to start, the easiest to remember. Whatever today looks like, you showed up.`,
      };
    },
  },
  {
    id: "warm_slip",
    category: "warm",
    motivationTags: ["control", "health"],
    surfaces: ["slip"],
    render: ({ summary }) => {
      const over = summary.cigsToday - summary.capToday;
      if (over <= 0) return null;
      const stillBelow = summary.baselineCigsPerDay - summary.cigsToday;
      if (stillBelow <= 0) return { text: `Today went over. Cravings aren't character flaws — they're chemistry. Tomorrow's a clean slate.` };
      return {
        text: `${over} over cap today, but still ${stillBelow} fewer than your starting baseline. That's like skipping the popcorn but still enjoying the movie.`,
      };
    },
  },
  {
    id: "warm_streak",
    category: "warm",
    motivationTags: ["control"],
    surfaces: ["stat_streak", "home_story"],
    render: ({ summary }) => {
      if (summary.streakDays < 1) return null;
      if (summary.streakDays < 7) return { text: `${summary.streakDays}-day streak — momentum is a quiet kind of magic.` };
      if (summary.streakDays < 21) return { text: `${summary.streakDays} days under cap — longer than the average New Year's resolution lasts.` };
      return { text: `${summary.streakDays} days strong. You're past the point most people give up — your brain is rewiring.` };
    },
  },
];

function recencyScore(seenTs: number | undefined): number {
  if (!seenTs) return 1;
  const days = (Date.now() - seenTs) / (1000 * 60 * 60 * 24);
  if (days < 1) return -2;
  if (days < 3) return -1;
  if (days < 7) return 0;
  if (days < 14) return 0.5;
  return 1;
}

export function selectNarration(ctx: NarrationContext): Narration | null {
  const seenMap = new Map(ctx.state.seenNarrationIds.map((s) => [s.id, s.ts]));
  const motivations = new Set(ctx.state.assessment?.motivations ?? []);

  let best: { score: number; n: Narration } | null = null;
  for (const t of TEMPLATES) {
    if (!t.surfaces.includes(ctx.surface)) continue;
    const out = t.render(ctx);
    if (!out) continue;
    const motivationOverlap = t.motivationTags.filter((m) => motivations.has(m)).length;
    const recency = recencyScore(seenMap.get(t.id));
    const jitter = Math.random() * 0.4;
    const score = motivationOverlap * 1.5 + recency + jitter;
    const n: Narration = {
      id: t.id,
      text: out.text,
      source: out.source,
      category: t.category,
      motivationTags: t.motivationTags,
    };
    if (!best || score > best.score) best = { score, n };
  }
  return best?.n ?? null;
}

export function markSeen(state: AppState, id: string): AppState {
  const filtered = state.seenNarrationIds.filter((s) => s.id !== id);
  return {
    ...state,
    seenNarrationIds: [...filtered, { id, ts: Date.now() }].slice(-200),
  };
}
