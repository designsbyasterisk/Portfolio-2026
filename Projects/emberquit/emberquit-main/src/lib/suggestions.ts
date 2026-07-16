import type { AppState, Trigger } from "./types";
import type { DailySummary } from "./analytics";
import { hourHistogram, triggerHistogram, cigsOnDay, startOfDay } from "./analytics";
import { dayIndex } from "./plan";

const DAY_MS = 86400000;

export interface Suggestion {
  id: string;
  icon: string; // emoji
  title: string;
  body: string;
  tag: "trigger" | "timing" | "streak" | "craving" | "money" | "general";
}

const TRIGGER_TIPS: Record<Trigger, { title: string; body: string }> = {
  stress: {
    title: "Swap stress smokes for 4-min box breathing",
    body: "Stress is your top trigger. Next time, try 4 rounds of 4-4-4-4 breathing — it outlasts most cravings.",
  },
  coffee: {
    title: "Untangle coffee from cigarettes",
    body: "Your coffee→cigarette loop is strong. Try sipping coffee in a smoke-free spot for 3 days to break the pairing.",
  },
  alcohol: {
    title: "Pre-commit before drinks",
    body: "Alcohol drops your guard. Decide your cap before the first drink and tell one person — accountability triples success.",
  },
  after_meals: {
    title: "Replace the post-meal cigarette",
    body: "Brush teeth or chew gum within 60 seconds after eating. The minty taste makes the cigarette feel wrong.",
  },
  driving: {
    title: "Make the car a smoke-free zone",
    body: "Stash mints, sunflower seeds, or a fidget toy in the cup holder. Your hands need a job — give them one.",
  },
  social: {
    title: "Have a 5-second exit line ready",
    body: "Most social smokes start with 'sure, I'll join.' Practice: 'I'm taking a break from these — I'll catch up inside.'",
  },
  boredom: {
    title: "Boredom is the easiest trigger to win",
    body: "When you feel the itch from boredom, set a 4-minute timer and do anything physical: walk, stretch, push-ups.",
  },
  phone_breaks: {
    title: "Phone breaks ≠ smoke breaks",
    body: "Move outside without cigarettes for 2 minutes. Your brain wants the pause, not the nicotine.",
  },
  waking_up: {
    title: "Delay your first cigarette by 15 minutes",
    body: "Morning cigarettes hit hardest. Each 15-minute delay weakens the dependence loop. Drink water first.",
  },
  other: {
    title: "Name your trigger to tame it",
    body: "Log the situation next time you smoke — once you can name it, you can plan around it.",
  },
};

export function buildSuggestions(state: AppState, summary: DailySummary): Suggestion[] {
  const out: Suggestion[] = [];
  const cigs = state.cigarettes;
  const triggers = triggerHistogram(cigs);
  delete triggers.unknown;

  // 1. Top trigger
  const sorted = Object.entries(triggers).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    const [topKey, topCount] = sorted[0];
    const pct = Math.round((topCount / cigs.length) * 100);
    const tip = TRIGGER_TIPS[topKey as Trigger] ?? TRIGGER_TIPS.other;
    out.push({
      id: "top-trigger",
      icon: "🎯",
      title: tip.title,
      body: `${pct}% of your cigarettes follow "${topKey.replace(/_/g, " ")}". ${tip.body}`,
      tag: "trigger",
    });
  }

  // 2. Peak hour
  const hours = hourHistogram(cigs);
  const peakHour = hours.indexOf(Math.max(...hours));
  if (cigs.length >= 5 && hours[peakHour] > 0) {
    const window = `${peakHour}:00–${(peakHour + 1) % 24}:00`;
    out.push({
      id: "peak-hour",
      icon: "⏰",
      title: `Pre-empt your ${window} peak`,
      body: `That single hour holds ${Math.round((hours[peakHour] / cigs.length) * 100)}% of your cigarettes. Schedule a walk, snack, or call there for 3 days — disrupt the pattern.`,
      tag: "timing",
    });
  }

  // 3. Last 7 days trend
  const today = startOfDay();
  const last7 = Array.from({ length: 7 }, (_, i) =>
    cigsOnDay(cigs, new Date(today.getTime() - (6 - i) * DAY_MS)),
  );
  const firstHalf = last7.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const lastHalf = last7.slice(4).reduce((a, b) => a + b, 0) / 3;
  if (firstHalf > 0 && lastHalf < firstHalf) {
    const drop = Math.round(((firstHalf - lastHalf) / firstHalf) * 100);
    out.push({
      id: "trend-down",
      icon: "📉",
      title: `You're trending down ${drop}% this week`,
      body: `Momentum is real. Lock it in — set tomorrow's cap one cigarette below today and your brain will follow the curve.`,
      tag: "streak",
    });
  } else if (lastHalf > firstHalf && firstHalf > 0) {
    out.push({
      id: "trend-up",
      icon: "🌱",
      title: "Small bump — not a setback",
      body: `The last few days ticked up. One quiet evening with no cigarettes resets the trajectory. Pick tonight.`,
      tag: "streak",
    });
  }

  // 4. Cravings beaten
  const beats = state.cravings.filter((c) => c.outcome === "beat").length;
  const smoked = state.cravings.filter((c) => c.outcome === "smoked").length;
  if (beats + smoked >= 3) {
    const winRate = Math.round((beats / (beats + smoked)) * 100);
    if (winRate >= 60) {
      out.push({
        id: "craving-strong",
        icon: "💪",
        title: `${winRate}% craving win-rate — you're elite`,
        body: `You're beating most cravings already. Try the "5-minute delay" rule next: every craving waits 5 minutes before counting.`,
        tag: "craving",
      });
    } else {
      out.push({
        id: "craving-coach",
        icon: "🌊",
        title: "Cravings peak at 3 minutes — then fade",
        body: `Your win-rate is ${winRate}%. Open the SOS tool the moment a craving starts and ride the 4-minute wave. Most fade before the timer ends.`,
        tag: "craving",
      });
    }
  }

  // 5. Streak
  if (summary.streakDays >= 3) {
    out.push({
      id: "streak",
      icon: "🔥",
      title: `${summary.streakDays}-day streak under cap`,
      body: `Don't break the chain. Even one cigarette under tomorrow's cap counts as a win — aim for "just barely" if you have to.`,
      tag: "streak",
    });
  }

  // 6. Money / motivation
  if (summary.moneySavedTotal >= 5) {
    out.push({
      id: "money",
      icon: "💰",
      title: `You've saved ${state.profile.currency}${summary.moneySavedTotal.toFixed(summary.moneySavedTotal < 50 ? 2 : 0)} so far`,
      body: `Move it out of "vague savings" — transfer the amount to a separate account weekly. Visible money is motivating money.`,
      tag: "money",
    });
  }

  // 7. Fallback
  if (out.length === 0) {
    out.push({
      id: "log-more",
      icon: "📝",
      title: "Log a few more days to unlock personal tips",
      body: "We need 5–7 entries to spot your patterns. Tap the cigarette button each time — even retroactively — and we'll tailor advice from there.",
      tag: "general",
    });
  }

  return out.slice(0, 5);
}
