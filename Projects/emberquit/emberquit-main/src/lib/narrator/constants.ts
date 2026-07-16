/**
 * Scientific & cultural constants for the Narrator.
 * Sources are approximate, rounded for narrative use, with rough citations.
 */

// Environmental
export const CO2_GRAMS_PER_CIG = 14; // ~14g CO2-equivalent per cigarette (lifecycle, WHO/IPCC est.)
export const BUTT_LITTER_FRAC = 0.65; // ~65% of butts end up as litter (WHO)
export const WATER_LITERS_PER_CIG = 3.7; // tobacco production water footprint, est.

// Time
export const MINUTES_PER_CIG = 6; // average smoke break length
export const CRAVING_PEAK_MIN = 4; // typical craving peak duration

// Health milestones (hours since last cigarette → readable wins)
export const HEALTH_MILESTONES: { hours: number; title: string; body: string }[] = [
  { hours: 0.33, title: "20 minutes", body: "Heart rate and blood pressure drop toward normal." },
  { hours: 12, title: "12 hours", body: "Carbon monoxide in your blood drops to a normal level." },
  { hours: 48, title: "2 days", body: "Your sense of smell and taste begin to come back." },
  { hours: 72, title: "3 days", body: "Bronchial tubes relax — breathing feels easier." },
  { hours: 24 * 14, title: "2 weeks", body: "Circulation improves and lung function rises." },
  { hours: 24 * 30, title: "1 month", body: "Coughing and shortness of breath decrease noticeably." },
  { hours: 24 * 90, title: "3 months", body: "Lung function up ~10%. Workouts feel different." },
  { hours: 24 * 365, title: "1 year", body: "Risk of coronary heart disease cut in half." },
];

// Pop-culture comparisons (en-US default). Easy to swap by locale later.
export const MOVIE_RUNTIMES_MIN = [
  { title: "a sitcom episode", min: 22 },
  { title: "an episode of The Office", min: 22 },
  { title: "a feature film", min: 110 },
  { title: "the Lord of the Rings extended trilogy", min: 681 },
  { title: "the entire Harry Potter saga", min: 1179 },
  { title: "every Marvel movie back-to-back", min: 3000 },
];

export const MONEY_COMPARISONS = [
  { min: 5, label: "a fancy coffee" },
  { min: 15, label: "a movie ticket" },
  { min: 25, label: "a paperback novel" },
  { min: 50, label: "a really good dinner for one" },
  { min: 100, label: "a great dinner for two" },
  { min: 150, label: "noise-cancelling earbuds" },
  { min: 300, label: "a weekend getaway" },
  { min: 600, label: "a flight somewhere new" },
  { min: 1200, label: "a nice second-hand bike" },
  { min: 3000, label: "a long-haul vacation" },
];

export const CO2_COMPARISONS = [
  { kg: 1, label: "charging your phone for a year" },
  { kg: 5, label: "a 25-mile car drive" },
  { kg: 18, label: "a tank of gas un-burned" },
  { kg: 50, label: "a one-way flight from NYC to Boston" },
  { kg: 200, label: "a tree's yearly CO₂ absorption" },
  { kg: 900, label: "a one-way transatlantic flight" },
];

export function pickScale<T extends { min?: number; kg?: number }>(items: T[], value: number): T {
  let best = items[0];
  for (const item of items) {
    const v = (item.min ?? item.kg ?? 0) as number;
    if (value >= v) best = item;
  }
  return best;
}
