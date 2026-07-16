## Ember — Quit Smoking, Gradually

A warm, encouraging app that helps users quit smoking using a personalized hybrid of gradual tapering and CBT-based trigger coaching. Progress is celebrated through streaks, badges, levels, money-saved, health milestones, and a living companion that grows alongside the user. Every stat is delivered as a vivid, relatable story — never a plain number.

---

### 1. First-run experience

**Welcome carousel (3 screens)** — sets the warm, non-judgmental tone: "We don't shame slips. We celebrate every cigarette you didn't smoke."

**Standard onboarding assessment (~5–7 min)**
1. Basics — age range, cigarettes/day, years smoking, brand/cost per pack.
2. Fagerström Test for Nicotine Dependence (6 questions) → dependence score (low/medium/high).
3. Trigger mapping — multi-select (stress, coffee, alcohol, after meals, driving, social, boredom, phone breaks, waking up) + free-text "other".
4. Daily routine — typical wake/sleep, work pattern, when cravings hit hardest.
5. Past quit attempts — how many, what worked, what didn't.
6. Motivation — pick top 3 (health, family, money, fitness, freedom, smell, pregnancy, control) + one personal "why" sentence.
7. Goal — quit date target OR "let the app decide based on my dependence."

End screen: a personalized plan summary and account prompt (skip / create later).

### 2. The personalized journey (Hybrid method)

**A. Gradual reduction schedule** — daily cap that steps down on a curve calibrated to Fagerström score (Low ~6 wk, Medium ~10 wk, High ~14 wk to zero). Adapts weekly based on actual logging.

**B. CBT trigger coaching** — when a user logs a cigarette or hits "I have a craving," they get a contextual micro-intervention matched to their top triggers (craving-surfing timer, breathing, replacement actions, reframe prompts).

### 3. Storyteller feedback engine (the new core idea)

A dedicated module — the **Narrator** — turns every stat into a fun, impactful, scientifically-grounded comparison. It runs whenever a number would otherwise be shown plainly, and rotates phrasing so it never feels repetitive.

**Three flavors of narration:**

- **Projection stories** — extrapolate the user's current behavior into a vivid future.
  - "You smoked 5 fewer today. Keep that up for a year and you'll spare the air **18 kg of CO₂** — about a full **tank of gas not burned**."
  - "Three smoke-free days in a row. At this pace, by your birthday you'll have given your lungs back the equivalent of **climbing 4 flights of stairs without losing breath**."

- **Scale comparisons** — translate raw quantities into things humans can picture.
  - "The average smoker takes ~10 cigarette breaks a day — **80 minutes**. Over a month, that's bingeing **'The Lord of the Rings' trilogy back-to-back, twice**."
  - "You've saved $48 this month. That's **a really good dinner for two**, or **3 months of Spotify**."
  - "You beat 12 cravings this week. Each lasts ~4 minutes — you out-waited **48 minutes of urges**, longer than a sitcom episode with ads."

- **Body & world wins** — reframe health milestones as movie-trailer moments.
  - "It's been 72 hours. Your bronchial tubes are relaxing. Translation: **breathing just got easier — like switching from a clogged straw to an open one**."
  - "1 month smoke-free would mean **600 fewer cigarette butts in oceans** (the #1 ocean litter item) and lung function up ~10%."

**How it appears:**
- A **"Story of the Day" card** on the home screen, refreshed every morning from the user's actual data.
- **Inline narration** under any stat (money saved, streak, cravings beaten) — a one-line punchy comparison, tappable for the deeper story.
- **Celebration moments** — when a milestone unlocks, a full-screen narrated reveal with companion animation.
- **Slip reframes** — even setbacks get warm narration: "You smoked 2 over your cap today. That's still **6 fewer than your starting baseline** — like skipping the popcorn but still enjoying the movie."

**How it stays fresh & accurate:**
- A library of ~150 templates across categories (environment, money, time, health, pop-culture, food/drink, distance/travel) with placeholder slots filled from user data.
- Each template carries a unit + source (e.g. "14 mg CO₂ per cigarette, EPA"), so comparisons are grounded.
- A weighting system favors comparisons aligned with the user's stated motivation (chose "family" → more time/relationship framings; chose "money" → more purchasing-power framings).
- A "seen recently" filter avoids repeats for ~2 weeks.
- A locale/currency setting tunes references (movies, snacks, currency) appropriately; default English/USD with easy expansion.

### 4. Home screen

```text
+------------------------------------------+
| Good morning, Alex   [companion: Ember 🌱]|
|                                          |
|        ⭕ 4 / 8 today                    |
|                                          |
|  📖 Story of the day                     |
|  "You're 3 cigs under pace. Year-on-     |
|   year that's a tank of gas un-burned."  |
|                                          |
|  [I smoked]      [I beat a craving]      |
|                                          |
|  🔥 12 days · longer than the average    |
|     person's New Year resolution lasts   |
|  💰 $48 saved · a great dinner for two   |
|  ❤️ Day 14 · circulation rebooting       |
+------------------------------------------+
```

### 5. Reward system (combined)

Streaks · Badges · XP & Levels · Money saved · Health timeline · Companion "Ember" that grows from seedling to bloom to tree. Wilts gently after slips but never dies — recoverable in 2 good days. Every reward unlock is delivered through the Narrator, so it lands as a story, not a number.

### 6. Other screens

- **Log** — calendar heatmap; tap a day for narrated detail ("Your best Tuesday this month").
- **Insights** — pattern recognition with narrated takeaways: "Mondays 8–10am are your toughest hour — that's when 31% of your cigarettes happen, roughly **the length of your morning commute**."
- **Toolkit** — CBT exercises, breathing timers, a browsable "Story library" of all the impactful comparisons the user has unlocked, SOS craving button.
- **Profile** — your why, plan settings, narration tone (playful / sincere / minimal), edit triggers, account, export data.

### 7. Accounts (optional)

App fully usable anonymously with local storage. After day 3, gentle banner: "Back up your streak in 10 seconds." Sign-up via Lovable Cloud (email + password, auto-confirm). On sign-in, local data migrates to cloud.

### 8. Visual & tone

Warm, calm, encouraging — never clinical. Soft gradients (ember orange → dawn pink → sage green), generous whitespace, rounded cards, friendly typography. Micro-animations on every reward moment. Zero shaming language anywhere; slips are reframed as data.

---

### Technical notes

- **Stack**: React + Vite + Tailwind + shadcn/ui (existing). Charts via `recharts`. Local persistence via typed `localStorage` wrapper; cloud sync via Lovable Cloud (Supabase) when user opts in.
- **Plan engine**: pure TS module — input (Fagerström score, baseline cigs/day, triggers, start date) → output (daily cap schedule + recommended interventions).
- **Narrator engine**: pure TS module `src/lib/narrator/`. Structure:
  - `templates.ts` — array of `{ id, category, motivationTags, requires: ['cigsAvoided'|'streak'|'moneySaved'|...], render: (vars) => string, source }`.
  - `constants.ts` — scientific constants (CO₂/cig, butts/cig in environment, money math, cravings duration, etc.) with citations.
  - `select.ts` — given user state + recently-seen list, picks the highest-scoring template by motivation match and freshness.
  - `pop.ts` — pop-culture comparison helpers (movie runtimes, common purchases) keyed by locale.
  - Single hook `useNarration(context)` returns a narrated string for any place in the UI.
- **Pattern recognition**: client-side aggregation over the user's log (hour-of-day histogram, trigger frequency, day-of-week trends).
- **Data model** (cloud, when account created): `profiles`, `assessments`, `plans`, `daily_logs`, `cigarette_events`, `craving_events`, `badges_earned`, `companion_state`, `seen_narrations`. RLS so each user only reads their own rows; roles in a separate `user_roles` table per security best practices.
- **Routing**: `/` onboarding gate → `/home`, `/log`, `/insights`, `/toolkit`, `/profile`, `/auth`.

### What we'll build first

1. Design system (color tokens, typography, motion primitives).
2. Onboarding flow (7 steps + plan summary) with local persistence.
3. Plan engine + Narrator engine (with seeded template library and scientific constants).
4. Home screen — daily ring, log buttons, Story of the Day, narrated stat strip, companion.
5. Log screen + craving SOS flow with CBT interventions.
6. Insights screen with pattern detection + narrated takeaways.
7. Toolkit (exercises, health timeline, narrated story library, breathing).
8. Optional account (Lovable Cloud) + data sync + migration from local.
9. Badges, XP/levels, companion growth, full-screen narrated celebration moments.