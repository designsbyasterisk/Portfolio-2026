// Core types for Ember

export type Trigger =
  | "stress"
  | "habit"
  | "coffee"
  | "alcohol"
  | "after_meals"
  | "driving"
  | "social"
  | "boredom"
  | "phone_breaks"
  | "waking_up"
  | "other";

export type Motivation =
  | "health"
  | "family"
  | "money"
  | "fitness"
  | "freedom"
  | "smell"
  | "pregnancy"
  | "control";

export type DependenceLevel = "low" | "medium" | "high";

export interface Assessment {
  // Basics
  ageRange: string;
  cigsPerDay: number;
  yearsSmoking: number;
  pricePerPack: number; // user's currency
  cigsPerPack: number; // default 20

  // Fagerström answers (indexes into question options)
  fagerstrom: number[]; // length 6

  // Triggers
  triggers: Trigger[];
  triggerOther?: string;

  // Routine
  hardestTime: "morning" | "afternoon" | "evening" | "night";

  // History
  pastAttempts: number;
  pastAttemptsNote?: string;

  // Motivation
  motivations: Motivation[];
  whySentence: string;

  // Goal
  goalMode: "let_app_decide" | "target_date";
  targetDate?: string; // ISO
}

export interface QuitPlan {
  startDate: string; // ISO
  dependenceLevel: DependenceLevel;
  fagerstromScore: number; // 0..10
  weeks: number;
  // schedule[i] = daily cap for day i (0-indexed). length = weeks * 7 + 1, last = 0.
  schedule: number[];
  baselineCigsPerDay: number;
}

export interface CigaretteEvent {
  id: string;
  ts: number; // ms epoch
  trigger?: Trigger;
}

export interface CravingEvent {
  id: string;
  ts: number;
  outcome: "beat" | "smoked";
  trigger?: Trigger;
  durationSec?: number;
}

export interface CompanionState {
  name: string; // "Ember"
  stage: "seed" | "sprout" | "bloom" | "tree";
  vitality: number; // 0..100
}

export interface UserProfile {
  displayName?: string;
  currency: string; // "₹"
  locale: string; // "en-IN"
  narrationTone: "playful" | "sincere" | "minimal";
}

export interface AppState {
  schemaVersion: 1;
  profile: UserProfile;
  assessment?: Assessment;
  plan?: QuitPlan;
  cigarettes: CigaretteEvent[];
  cravings: CravingEvent[];
  companion: CompanionState;
  badges: string[]; // badge ids earned
  xp: number;
  seenNarrationIds: { id: string; ts: number }[];
  onboardedAt?: number;
}
