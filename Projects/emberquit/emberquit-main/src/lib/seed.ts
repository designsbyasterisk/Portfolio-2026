import type { AppState, CigaretteEvent, CravingEvent, Trigger } from "./types";
import { startOfDay } from "./analytics";
import { todayCap, dayIndex } from "./plan";

const TRIGGERS: Trigger[] = [
  "stress", "coffee", "after_meals", "boredom", "phone_breaks", "social", "driving", "waking_up",
];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

/**
 * Seed ~7 days of realistic test data: gradually decreasing cigarette counts
 * with weighted trigger distribution and a few cravings beaten per day.
 */
export function seedWeekOfData(state: AppState): AppState {
  if (!state.plan || !state.assessment) return state;

  const today = startOfDay();
  const baseline = state.assessment.cigsPerDay;
  const cigarettes: CigaretteEvent[] = [];
  const cravings: CravingEvent[] = [];

  for (let dayBack = 6; dayBack >= 0; dayBack--) {
    const day = new Date(today.getTime() - dayBack * 86400000);
    const cap = state.plan.schedule[Math.min(dayIndex(state.plan, day), state.plan.schedule.length - 1)];

    // Aim ~80% of users: at or just under cap. Today is partial.
    const target = dayBack === 0
      ? Math.max(0, Math.floor(Math.min(cap, baseline) * 0.4))
      : Math.max(0, Math.round(cap * (0.7 + Math.random() * 0.5)));

    for (let i = 0; i < target; i++) {
      // Bias hours: morning, lunch, afternoon, after work
      const buckets = [8, 9, 10, 12, 13, 15, 16, 17, 18, 20, 21];
      const hour = buckets[Math.floor(Math.random() * buckets.length)];
      const minute = Math.floor(Math.random() * 60);
      const ts = new Date(day);
      ts.setHours(hour, minute, Math.floor(Math.random() * 60), 0);
      cigarettes.push({
        id: crypto.randomUUID(),
        ts: ts.getTime(),
        trigger: rand(TRIGGERS),
      });
    }

    // 1-3 cravings beaten per day
    const beats = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < beats; i++) {
      const ts = new Date(day);
      ts.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
      cravings.push({
        id: crypto.randomUUID(),
        ts: ts.getTime(),
        outcome: "beat",
        trigger: rand(TRIGGERS),
        durationSec: 180 + Math.floor(Math.random() * 180),
      });
    }
  }

  return {
    ...state,
    cigarettes: [...state.cigarettes, ...cigarettes].sort((a, b) => a.ts - b.ts),
    cravings: [...state.cravings, ...cravings].sort((a, b) => a.ts - b.ts),
    xp: state.xp + cravings.length * 10,
  };
}
