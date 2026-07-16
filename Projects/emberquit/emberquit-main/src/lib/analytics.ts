import type { AppState, CigaretteEvent, CravingEvent, Trigger } from "./types";
import { todayCap, dayIndex } from "./plan";

const DAY_MS = 1000 * 60 * 60 * 24;

export function startOfDay(d: Date | number = new Date()): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function cigsOnDay(events: CigaretteEvent[], day: Date): number {
  const start = startOfDay(day).getTime();
  const end = start + DAY_MS;
  return events.filter((e) => e.ts >= start && e.ts < end).length;
}

export function cravingsBeatenOnDay(events: CravingEvent[], day: Date): number {
  const start = startOfDay(day).getTime();
  const end = start + DAY_MS;
  return events.filter((e) => e.ts >= start && e.ts < end && e.outcome === "beat").length;
}

export interface DailySummary {
  cigsToday: number;
  capToday: number;
  cravingsBeatenToday: number;
  cigsAvoidedToday: number; // baseline - cigsToday (clamped 0)
  totalCigsAvoided: number;
  moneySavedTotal: number;
  streakDays: number; // consecutive days at or under cap (excludes today if not finished)
  daysSinceStart: number;
  cigsPerPack: number;
  pricePerPack: number;
  baselineCigsPerDay: number;
}

export function summarize(state: AppState, now = new Date()): DailySummary {
  const a = state.assessment;
  const plan = state.plan;
  const cigs = state.cigarettes;
  const cravings = state.cravings;

  const baseline = a?.cigsPerDay ?? 0;
  const pricePerPack = a?.pricePerPack ?? 0;
  const cigsPerPack = a?.cigsPerPack ?? 20;

  const cigsToday = cigsOnDay(cigs, now);
  const capToday = plan ? todayCap(plan, now) : baseline;
  const cravingsBeatenToday = cravingsBeatenOnDay(cravings, now);
  const cigsAvoidedToday = Math.max(0, baseline - cigsToday);

  // Total avoided since plan start
  let totalCigsAvoided = 0;
  if (plan) {
    const days = dayIndex(plan, now) + 1;
    for (let i = 0; i < days; i++) {
      const day = new Date(plan.startDate);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() + i);
      const c = cigsOnDay(cigs, day);
      totalCigsAvoided += (baseline - c);
    }
  }

  const moneySavedTotal = Math.max(0, (totalCigsAvoided / cigsPerPack) * pricePerPack);

  // Streak: walk back from yesterday counting days under cap
  let streakDays = 0;
  if (plan) {
    for (let i = 1; i < 365; i++) {
      const day = new Date(now.getTime() - i * DAY_MS);
      const dStart = startOfDay(day);
      if (dStart.getTime() < startOfDay(new Date(plan.startDate)).getTime()) break;
      const c = cigsOnDay(cigs, day);
      const cap = plan.schedule[Math.min(dayIndex(plan, day), plan.schedule.length - 1)];
      if (c <= cap) streakDays++;
      else break;
    }
    // Include today if already under cap
    if (cigsToday <= capToday) streakDays += 1;
  }

  return {
    cigsToday,
    capToday,
    cravingsBeatenToday,
    cigsAvoidedToday,
    totalCigsAvoided,
    moneySavedTotal,
    streakDays,
    daysSinceStart: plan ? dayIndex(plan, now) : 0,
    cigsPerPack,
    pricePerPack,
    baselineCigsPerDay: baseline,
  };
}

export function triggerHistogram(events: CigaretteEvent[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of events) {
    const k = e.trigger ?? "unknown";
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export function hourHistogram(events: CigaretteEvent[]): number[] {
  const hours = new Array(24).fill(0);
  for (const e of events) hours[new Date(e.ts).getHours()]++;
  return hours;
}

export function topTrigger(events: CigaretteEvent[]): Trigger | undefined {
  const hist = triggerHistogram(events);
  delete hist.unknown;
  let best: { k: string; n: number } | null = null;
  for (const [k, n] of Object.entries(hist)) {
    if (!best || n > best.n) best = { k, n };
  }
  return (best?.k as Trigger) || undefined;
}
