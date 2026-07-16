# F1 Telemetry Dashboard: Race Data Connection Guide

This document describes how race data from the 2024 Monaco Grand Prix is structured, processed, and piped into the interactive dashboard.

---

## 1. Data Source & Preparation

The dashboard relies on real-world race telemetry and timing data from the **2024 Monaco Grand Prix**.

- **Ergast / Jolpica F1 API**: The underlying data (lap times, grid positions, pit stops, and final results) was queried from the public Ergast/Jolpica F1 databases.
- **Static Data Storage**: The fetched payload is stored locally in [monaco2024.json](file:///c:/Users/shrey/OneDrive/Desktop/F1%20Dashboard/grandprix-view-main/grandprix-view-main/src/data/monaco2024.json) to eliminate runtime network latency and allow the application to run completely standalone.

---

## 2. Replay Timeline Cleaning

During the real 2024 Monaco Grand Prix, a severe crash on Lap 1 involving Sergio Perez, Kevin Magnussen, and Nico Hulkenberg triggered a **30-minute red flag**. In the raw data, this creates a massive 2400-second outlier for Lap 1 and causes grid-restart spacing anomalies.

To ensure the replay is watchable and interactive:
- The data engine in [f1Mock.ts](file:///c:/Users/shrey/OneDrive/Desktop/F1%20Dashboard/grandprix-view-main/grandprix-view-main/src/data/f1Mock.ts) filters out the red-flag stoppage time.
- Laps 1 and 2 are replaced with each driver's median pace.
- A **grid stagger offset** (~0.45 seconds per grid position) is added to the lap starts so the cars appear properly separated on the grid before the race start.

---

## 3. Frame Generation Pipeline (`generateReplay`)

Instead of processing raw data dynamically on the fly, the dashboard pre-compiles the entire race timing dataset into high-fidelity playback frames:

```
+------------------+     +-----------------------+     +-------------------+
| rawResults       | --> | timelines (DriverTimeline) | --> | generateReplay()  |
| rawLapTimes      |     | - lapSec              |     | - 2 Frames / Sec  |
| (monaco2024.json)|     | - cumSec              |     | - compute lapsDone|
+------------------+     +-----------------------+     +-------------------+
                                                                 |
                                                                 v
                                                       +-------------------+
                                                       | ReplayFrame Array |
                                                       | - t (time)        |
                                                       | - cars[]          |
                                                       +-------------------+
```

1. **Cumulative Elapsed Time**: Lap durations (`lapSec`) are mapped to cumulative race seconds (`cumSec`).
2. **Frequency (FPS)**: Frames are generated at **2 Frames Per Second (FPS)**.
3. **Binary Search Lookup**: For every frame, the generator runs a binary search via `locate(timeline, time)` to calculate:
   - What lap the driver is currently completing.
   - The fractional progress through that lap (`0.0` to `1.0`).
4. **Leaderboard Resolution**: Drivers are sorted by their cumulative completed laps (`lapsDone`). The sorted order determines their real-time position (1st to 20th) shown on the live standing board.

---

## 4. Telemetry Synthesis & Retirements

Telemetry parameters (speed, gear, RPM, throttle, and brake) are synthesized frame-by-frame based on the driver's progress along the track loop:

- **Braking & Acceleration**: When the fractional progress indicates a corner (modeled via sine-wave patterns of the lap fraction), speed drops, the brake input rises (Red indicator), and throttle drops. On straight stretches, the throttle hits 100% (Green indicator) and speed rises.
- **Early Retirements**: Drivers who crashed or retired early (e.g., Perez, Magnussen, Hulkenberg, Ocon) are monitored. Once the replay time crosses their respective retirement time, their speed, gear, throttle, and brake values are locked to `0`, and their status is marked as retired.

---

## 5. State Synchronization (Zustand & React Components)

A single global Zustand store, [useReplay.ts](file:///c:/Users/shrey/OneDrive/Desktop/F1%20Dashboard/grandprix-view-main/grandprix-view-main/src/hooks/useReplay.ts), acts as the main synchronization hub:

- **Global Time State**: The store keeps track of the active `time`.
- **Playback Loop**: When `isPlaying` is true, a tick loop increment updates the active `time` based on selected speed multiplier.
- **Unified Rendering**: Every widget in the grid uses the `useReplay` hook to select the active `ReplayFrame` corresponding to `time`:
  - **Leaderboard**: Displays interval gaps and lap times based on the frame.
  - **3D Track**: Reads coordinates along the path using the progress ratio.
  - **Telemetry Gauges**: Updates gauges using throttle, brake, gear, and speed properties of the active frame.
