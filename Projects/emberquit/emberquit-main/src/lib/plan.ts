import type { Assessment, DependenceLevel, QuitPlan } from "./types";

// Fagerström Test for Nicotine Dependence
// 6 questions, scored 0..10
export const FAGERSTROM_QUESTIONS: {
  q: string;
  options: { label: string; score: number }[];
}[] = [
  {
    q: "How soon after waking do you smoke your first cigarette?",
    options: [
      { label: "Within 5 minutes", score: 3 },
      { label: "6 to 30 minutes", score: 2 },
      { label: "31 to 60 minutes", score: 1 },
      { label: "After 60 minutes", score: 0 },
    ],
  },
  {
    q: "Do you find it difficult to refrain from smoking in places where it's forbidden?",
    options: [
      { label: "Yes", score: 1 },
      { label: "No", score: 0 },
    ],
  },
  {
    q: "Which cigarette would you hate most to give up?",
    options: [
      { label: "The first one in the morning", score: 1 },
      { label: "Any other", score: 0 },
    ],
  },
  {
    q: "How many cigarettes do you smoke per day?",
    options: [
      { label: "10 or fewer", score: 0 },
      { label: "11 to 20", score: 1 },
      { label: "21 to 30", score: 2 },
      { label: "31 or more", score: 3 },
    ],
  },
  {
    q: "Do you smoke more frequently in the first hours after waking than during the rest of the day?",
    options: [
      { label: "Yes", score: 1 },
      { label: "No", score: 0 },
    ],
  },
  {
    q: "Do you smoke even when you're so ill you're in bed most of the day?",
    options: [
      { label: "Yes", score: 1 },
      { label: "No", score: 0 },
    ],
  },
];

export function scoreFagerstrom(answers: number[]): number {
  let total = 0;
  for (let i = 0; i < FAGERSTROM_QUESTIONS.length; i++) {
    const idx = answers[i];
    if (idx == null) continue;
    total += FAGERSTROM_QUESTIONS[i].options[idx]?.score ?? 0;
  }
  return total;
}

export function dependenceLevelFromScore(score: number): DependenceLevel {
  if (score <= 3) return "low";
  if (score <= 6) return "medium";
  return "high";
}

const WEEKS_BY_LEVEL: Record<DependenceLevel, number> = {
  low: 6,
  medium: 10,
  high: 14,
};

/**
 * Build a daily cap schedule that gradually steps down from baseline to 0.
 * Uses an ease-out curve so early reductions are gentler for high dependence.
 */
export function buildPlan(assessment: Assessment, startDate = new Date()): QuitPlan {
  const score = scoreFagerstrom(assessment.fagerstrom);
  const level = dependenceLevelFromScore(score);
  const weeks = WEEKS_BY_LEVEL[level];
  const days = weeks * 7;
  const baseline = Math.max(1, assessment.cigsPerDay);

  // Curve exponent: higher dependence → slower start (larger exponent)
  const exp = level === "high" ? 1.8 : level === "medium" ? 1.4 : 1.1;

  const schedule: number[] = [];
  for (let d = 0; d <= days; d++) {
    const t = d / days; // 0..1
    const remainingFrac = Math.pow(1 - t, exp);
    const cap = Math.round(baseline * remainingFrac);
    schedule.push(Math.max(0, cap));
  }
  schedule[schedule.length - 1] = 0;

  return {
    startDate: startDate.toISOString(),
    dependenceLevel: level,
    fagerstromScore: score,
    weeks,
    schedule,
    baselineCigsPerDay: baseline,
  };
}

export function dayIndex(plan: QuitPlan, now = new Date()): number {
  const start = new Date(plan.startDate);
  start.setHours(0, 0, 0, 0);
  const current = new Date(now);
  current.setHours(0, 0, 0, 0);
  const ms = current.getTime() - start.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function todayCap(plan: QuitPlan, now = new Date()): number {
  const i = dayIndex(plan, now);
  return plan.schedule[Math.min(i, plan.schedule.length - 1)];
}
