import type { AppState, UserProfile, CompanionState } from "./types";

const KEY = "ember.state.v1";

const defaultProfile: UserProfile = {
  currency: "₹",
  locale: "en-IN",
  narrationTone: "playful",
};

const defaultCompanion: CompanionState = {
  name: "Ember",
  stage: "seed",
  vitality: 60,
};

export function defaultState(): AppState {
  return {
    schemaVersion: 1,
    profile: defaultProfile,
    cigarettes: [],
    cravings: [],
    companion: defaultCompanion,
    badges: [],
    xp: 0,
    seenNarrationIds: [],
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.schemaVersion !== 1) return defaultState();
    const merged = { ...defaultState(), ...parsed };
    // Force INR across the app
    merged.profile = { ...merged.profile, currency: "₹", locale: "en-IN" };
    return merged;
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    // Notify listeners in the same tab
    window.dispatchEvent(new CustomEvent("ember:state-change"));
  } catch {
    // ignore
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("ember:state-change"));
}
