## F1 3D Race Replay Dashboard

A cinematic, full-screen Formula 1 monitoring dashboard with an interactive 3D track at the center, animated cars replaying a race lap-by-lap, and live stat panels framing the scene.

### Layout

```text
┌──────────────────────────────────────────────────────────────┐
│  F1 LIVE  ·  Monaco GP — Lap 34/78        [Round 8 · 2026]   │  top bar
├──────────┬──────────────────────────────────┬────────────────┤
│ DRIVER   │                                  │  TELEMETRY     │
│ STANDINGS│        3D INTERACTIVE TRACK      │  speed/gear/   │
│  table   │        (orbit · zoom · cars)     │  throttle/brake│
│          │                                  │  tire compound │
│ CONSTRUCT│   ▶ ⏸  ━━━●━━━━━━━━ 1.0x         │                │
│ STANDINGS│   playback bar + speed control   │  NEXT RACE     │
│          │                                  │  countdown +   │
│          │                                  │  weather card  │
├──────────┴──────────────────────────────────┴────────────────┤
│  LAP TIMING CHART — selectable drivers, sector colors        │
└──────────────────────────────────────────────────────────────┘
```

### Center: 3D Race Replay

- Stylized Monaco-inspired circuit built from a closed Catmull-Rom curve, extruded as a flat ribbon with red/white kerb stripes and a start/finish line.
- Carbon-textured ground plane, soft rim lighting, subtle fog for depth.
- 6–10 F1 cars rendered as low-poly chassis with team-colored liveries and driver number decals. Cars follow the curve at speeds derived from mock lap/sector data, so positions shuffle realistically over the replay.
- Hovering a car highlights it and shows a floating label (driver name, gap, lap). Clicking focuses telemetry + lap chart on that car.
- OrbitControls for free camera, plus quick-view buttons: Top-down, Trackside, Chase cam (follows focused car).
- Playback bar under the canvas: play/pause, scrub through laps, speed (0.5x / 1x / 2x / 4x), lap counter.

### Stat Panels

- **Driver standings** (left): rank, number, driver, team color bar, points, last-race delta.
- **Constructor standings** (left, below): team, points, color stripe.
- **Telemetry gauges** (right): radial speed gauge, gear indicator, throttle/brake bars, current tire compound pill (Soft/Medium/Hard/Inter/Wet), all updating in sync with the focused car's replay frame.
- **Next race + weather** (right): countdown to next GP, circuit thumbnail, track temp / air temp / rain chance, mock 3-day forecast strip.
- **Lap timing chart** (bottom): line chart of lap times for up to 4 selected drivers, sector-colored markers (purple = personal best sector, green = improvement).

### Visual style — Carbon fiber + red

- Background: near-black (#0A0A0B) with a subtle carbon-weave texture overlay on panels.
- Accent: F1 red (`#E10600`), white text, muted gray-400 secondary text.
- Panels: translucent dark cards with thin red top border, sharp 2px corners, light inner glow on focused panel.
- Typography: tight uppercase headings (tracking-widest), tabular numerics for all stats.
- Animations: fade-in on mount, smooth gauge needle transitions, glowing pulse on the leading car.

### Mock data

A single `src/data/f1Mock.ts` module exporting:
- `drivers` (20 entries: name, number, team, color, points)
- `constructors` (10 teams)
- `replay` — array of frames `{ t, positions: [{driverId, progress(0–1), speed, gear, throttle, brake, tire, lap}] }` covering ~78 laps, generated procedurally so cars overtake, pit, and vary pace.
- `nextRace` (name, circuit, date, weather forecast).

A `useReplay` hook drives a shared time cursor; all panels and the 3D scene read from it so everything stays in sync during playback.

### Technical details

- Add `three@0.160`, `@react-three/fiber@^8.18`, `@react-three/drei@^9.122.0`.
- New files:
  - `src/data/f1Mock.ts` — mock dataset + replay generator.
  - `src/hooks/useReplay.ts` — playback cursor (time, isPlaying, speed, focusedDriverId).
  - `src/components/track/Track3D.tsx` — Canvas + scene (track curve, cars, lighting, controls, camera presets).
  - `src/components/track/CarMesh.tsx` — single car mesh with hover/select.
  - `src/components/panels/DriverStandings.tsx`, `ConstructorStandings.tsx`, `Telemetry.tsx`, `NextRace.tsx`, `LapTimingChart.tsx` (uses existing `recharts`).
  - `src/components/PlaybackBar.tsx`.
- Replace `src/pages/Index.tsx` with the dashboard layout (CSS grid).
- Extend `src/index.css` with carbon-fiber background utility and F1 red HSL tokens; add `--f1-red: 357 100% 44%` and a `.panel` utility (translucent card + red top border).
- Tailwind config: extend colors with `f1` palette and add subtle `pulse-glow` keyframe.
- Charts via existing `recharts` dependency; gauges built with SVG (no extra lib).
- Performance: cap DPR to 1.5, use `frameloop="demand"` only when paused, instanced kerb segments, single shared geometry for cars.

### Out of scope

- Real telemetry / live timing API integration.
- Authentication, persistence, or multi-user features.
- Accurate circuit geometry (stylized representation only).
