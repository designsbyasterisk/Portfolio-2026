import { useMemo, useState, Suspense, useRef, useEffect, Component, ReactNode, ErrorInfo, forwardRef } from "react";
import { Responsive, Layouts } from "react-grid-layout";
import { AboutLayout, keys } from "@/lib/layout.helper";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import DriverStandings from "@/components/panels/DriverStandings";
import DriverChampionship from "@/components/panels/DriverChampionship";
import ConstructorStandings from "@/components/panels/ConstructorStandings";
import LapTimingChart from "@/components/panels/LapTimingChart";
import Track3D from "@/components/track/Track3D";
import PlaybackBar from "@/components/PlaybackBar";
import Telemetry from "@/components/panels/Telemetry";
import CircuitSpecs from "@/components/panels/CircuitSpecs";
import RaceSummary from "@/components/panels/RaceSummary";
import RaceControlTicker from "@/components/panels/RaceControlTicker";
import PitStopStrategy from "@/components/panels/PitStopStrategy";
import DriverHeadToHead from "@/components/panels/DriverHeadToHead";
import IncidentTelemetry from "@/components/panels/IncidentTelemetry";
import ZoneTelemetry from "@/components/panels/ZoneTelemetry";
import TeamComparison from "@/components/panels/TeamComparison";
import { useReplay } from "@/hooks/useReplay";
import { 
  Lock, 
  Unlock,
  Trophy, 
  Flag, 
  Wrench, 
  Timer, 
  Map as LucideMap, 
  Gauge, 
  AlertCircle, 
  Zap,
  Settings2,
  Users
} from "lucide-react";

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("3D Canvas crashed:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const COLS = 8;
const ROWS = 12;

function getOriginalItem(id: string, breakpoint: string) {
  return AboutLayout[breakpoint === "xs" ? "xs" : "lg"].find(item => item.i === id);
}

function getCardConstraints(id: string, cols: number, isTall: boolean) {
  if (cols <= 1) return { minW: 1, maxW: 1 };
  if (id === "pitStopStrategy") return { minW: 1, maxW: 1 };
  switch (id) {
    case "liveReplay": return { minW: 4, maxW: 8 };
    case "telemetry": return { minW: 2, maxW: 8 };
    case "raceControlTicker": return { minW: 2, maxW: 8 };
    case "constructorsChampionship":
    case "driversChampionship":
    case "circuitSpecs":
    case "raceSummary":
    case "driverHeadToHead": return { minW: 1, maxW: 8 };
    default: return { minW: 2, maxW: 8 };
  }
}

function getCardHeightConstraints(id: string, isTall: boolean): { minH: number; maxH: number } {
  if (id === "raceControlTicker") return { minH: 1, maxH: 1 };
  if (id === "pitStopStrategy") return { minH: 4, maxH: 4 };
  if (id === "telemetry") return { minH: 3, maxH: 12 };
  if (id === "liveReplay") return { minH: 4, maxH: 12 };
  return { minH: 4, maxH: 12 };
}

function tryExpandLeft(layout: any[], grid: (string | null)[][], x: number, y: number, cols: number, isTall: boolean, changedItemId: string | null = null, lockedKeys: string[] = []): boolean {
  if (x <= 0) return false;
  const leftItemId = grid[y][x - 1];
  if (!leftItemId) return false;
  const item = layout.find(i => i.i === leftItemId);
  if (!item) return false;

  if (lockedKeys.includes(item.i)) return false;
  if (changedItemId && item.i === changedItemId) return false;

  const { maxW } = getCardConstraints(item.i, cols, isTall);
  if (item.w >= maxW) return false;

  const targetX = item.x + item.w;
  if (targetX >= cols) return false;

  for (let ty = item.y; ty < item.y + item.h; ty++) {
    if (ty >= grid.length) return false;
    if (grid[ty][targetX] !== null && grid[ty][targetX] !== leftItemId) return false;
  }
  item.w += 1;
  return true;
}

function tryExpandRight(layout: any[], grid: (string | null)[][], x: number, y: number, cols: number, isTall: boolean, changedItemId: string | null = null, lockedKeys: string[] = []): boolean {
  if (x >= cols - 1) return false;
  const rightItemId = grid[y][x + 1];
  if (!rightItemId) return false;
  const item = layout.find(i => i.i === rightItemId);
  if (!item) return false;

  if (lockedKeys.includes(item.i)) return false;
  if (changedItemId && item.i === changedItemId) return false;

  const { maxW } = getCardConstraints(item.i, cols, isTall);
  if (item.w >= maxW) return false;

  const targetX = item.x - 1;
  if (targetX < 0) return false;

  for (let ty = item.y; ty < item.y + item.h; ty++) {
    if (ty >= grid.length) return false;
    if (grid[ty][targetX] !== null && grid[ty][targetX] !== rightItemId) return false;
  }
  item.x -= 1;
  item.w += 1;
  return true;
}

function tryExpandTop(layout: any[], grid: (string | null)[][], x: number, y: number, isTall: boolean, changedItemId: string | null = null, lockedKeys: string[] = []): boolean {
  if (y <= 0) return false;
  const topItemId = grid[y - 1][x];
  if (!topItemId) return false;
  const item = layout.find(i => i.i === topItemId);
  if (!item) return false;

  if (lockedKeys.includes(item.i)) return false;
  if (changedItemId && item.i === changedItemId) return false;

  const { maxH } = getCardHeightConstraints(item.i, isTall);
  if (item.h >= maxH) return false;

  const targetY = item.y + item.h;
  if (targetY >= grid.length) return false;

  for (let tx = item.x; tx < item.x + item.w; tx++) {
    if (grid[targetY][tx] !== null && grid[targetY][tx] !== topItemId) return false;
  }
  item.h += 1;
  return true;
}

function tryExpandBottom(layout: any[], grid: (string | null)[][], x: number, y: number, isTall: boolean, changedItemId: string | null = null, lockedKeys: string[] = []): boolean {
  if (y >= grid.length - 1) return false;
  const bottomItemId = grid[y + 1][x];
  if (!bottomItemId) return false;
  const item = layout.find(i => i.i === bottomItemId);
  if (!item) return false;

  if (lockedKeys.includes(item.i)) return false;
  if (changedItemId && item.i === changedItemId) return false;

  const { maxH } = getCardHeightConstraints(item.i, isTall);
  if (item.h >= maxH) return false;

  const targetY = item.y - 1;
  if (targetY < 0) return false;

  for (let tx = item.x; tx < item.x + item.w; tx++) {
    if (grid[targetY][tx] !== null && grid[targetY][tx] !== bottomItemId) return false;
  }
  item.y -= 1;
  item.h += 1;
  return true;
}

function resolveOverlaysAndClamp(
  layout: any[],
  cols: number,
  rows: number,
  changedItem: any | null,
  lockedKeys: string[]
): any[] {
  const isTall = layout.length < keys.length;
  const sorted = [...layout].sort((a, b) => {
    const aLocked = lockedKeys.includes(a.i) || (changedItem && a.i === changedItem.i);
    const bLocked = lockedKeys.includes(b.i) || (changedItem && b.i === changedItem.i);
    if (aLocked && !bLocked) return -1;
    if (!aLocked && bLocked) return 1;

    // Process largest cards first so they find contiguous space
    const origA = getOriginalItem(a.i, "lg");
    const origB = getOriginalItem(b.i, "lg");
    const areaA = origA ? origA.w * origA.h : (a.w * a.h || 1);
    const areaB = origB ? origB.w * origB.h : (b.w * b.h || 1);
    return areaB - areaA;
  });

  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  const placed: any[] = [];

  for (const item of sorted) {
    const isFixed = lockedKeys.includes(item.i) || (changedItem && item.i === changedItem.i);
    let { x, y, w, h } = item;

    if (isFixed) {
      w = Math.max(1, Math.min(w, cols - x));
      h = Math.max(1, Math.min(h, rows - y));
      placed.push({ ...item, x, y, w, h });
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          grid[y + dy][x + dx] = item.i;
        }
      }
    } else {
      let found = false;
      for (let ty = y; ty <= rows - h; ty++) {
        const xTargets = [x];
        for (let tx = 0; tx <= cols - w; tx++) {
          if (tx !== x) xTargets.push(tx);
        }

        for (const tx of xTargets) {
          let fits = true;
          for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
              if (grid[ty + dy][tx + dx] !== null) {
                fits = false;
                break;
              }
            }
            if (!fits) break;
          }
          if (fits) {
            x = tx;
            y = ty;
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (!found) {
        const { minW } = getCardConstraints(item.i, cols, isTall);
        const { minH } = getCardHeightConstraints(item.i, isTall);
        
        let bestW = w;
        let bestH = h;
        let bestX = x;
        let bestY = y;
        let fitEmergency = false;

        for (let th = h; th >= minH; th--) {
          for (let tw = w; tw >= minW; tw--) {
            for (let ty = 0; ty <= rows - th; ty++) {
              for (let tx = 0; tx <= cols - tw; tx++) {
                let fits = true;
                for (let dy = 0; dy < th; dy++) {
                  for (let dx = 0; dx < tw; dx++) {
                    if (grid[ty + dy][tx + dx] !== null) {
                      fits = false;
                      break;
                    }
                  }
                  if (!fits) break;
                }
                if (fits) {
                  bestX = tx;
                  bestY = ty;
                  bestW = tw;
                  bestH = th;
                  fitEmergency = true;
                  break;
                }
              }
              if (fitEmergency) break;
            }
            if (fitEmergency) break;
          }
          if (fitEmergency) break;
        }

        if (fitEmergency) {
          x = bestX;
          y = bestY;
          w = bestW;
          h = bestH;
        } else {
          // Force it to be within grid boundary
          w = minW;
          h = minH;
          y = Math.max(0, Math.min(y, rows - h));
          x = Math.max(0, Math.min(x, cols - w));
        }
      }

      placed.push({ ...item, x, y, w, h });
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          if (y + dy < rows && x + dx < cols) {
            grid[y + dy][x + dx] = item.i;
          }
        }
      }
    }
  }

  return placed;
}

function expandLayout(
  layout: any[],
  cols: number,
  rows: number,
  isTall: boolean,
  changedItemId: string | null = null,
  lockedKeys: string[] = []
): any[] {
  const cloned = layout.map(item => ({ ...item }));
  let changed = true;
  let iterations = 0;
  const maxIterations = cols * rows * 4;

  while (changed && iterations < maxIterations) {
    iterations++;
    changed = false;

    const currentGrid = Array.from({ length: rows }, () => Array(cols).fill(null));
    for (const item of cloned) {
      for (let dy = 0; dy < item.h; dy++) {
        for (let dx = 0; dx < item.w; dx++) {
          const ny = item.y + dy;
          const nx = item.x + dx;
          if (ny < rows && nx < cols) {
            currentGrid[ny][nx] = item.i;
          }
        }
      }
    }

    let foundEmpty = false;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (currentGrid[y][x] === null) {
          foundEmpty = true;
          if (tryExpandLeft(cloned, currentGrid, x, y, cols, isTall, changedItemId, lockedKeys) ||
              tryExpandRight(cloned, currentGrid, x, y, cols, isTall, changedItemId, lockedKeys) ||
              tryExpandTop(cloned, currentGrid, x, y, isTall, changedItemId, lockedKeys) ||
              tryExpandBottom(cloned, currentGrid, x, y, isTall, changedItemId, lockedKeys)) {
            changed = true;
            break;
          }
        }
      }
      if (changed) break;
    }
    if (!foundEmpty) break;
  }
  return cloned;
}

function countEmptyCells(layout: any[], cols: number, rows: number): number {
  const currentGrid = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (const item of layout) {
    for (let dy = 0; dy < item.h; dy++) {
      for (let dx = 0; dx < item.w; dx++) {
        const ny = item.y + dy;
        const nx = item.x + dx;
        if (ny < rows && nx < cols) {
          currentGrid[ny][nx] = item.i;
        }
      }
    }
  }
  let count = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (currentGrid[y][x] === null) {
        count++;
      }
    }
  }
  return count;
}

function solveLayoutPlacementRec(
  items: any[],
  grid: (string | null)[][],
  itemIndex: number,
  cols: number,
  rows: number,
  placements: Map<string, any>,
  solutions: Map<string, any>[],
  solverState: { iterations: number; maxSolutions: number }
): void {
  solverState.iterations++;
  if (solverState.iterations > 2000) return;
  if (solutions.length >= solverState.maxSolutions) return;

  if (itemIndex === items.length) {
    solutions.push(new Map(placements));
    return;
  }

  const item = items[itemIndex];
  const minW = item.minW ?? 1;
  const minH = item.minH ?? 2;
  const startW = Math.max(item.wPref, minW);
  const startH = Math.max(item.hPref, minH);

  const candidates: { w: number, h: number }[] = [];
  for (let h = startH; h >= minH; h--) {
    for (let w = startW; w >= minW; w--) {
      candidates.push({ w, h });
    }
  }

  // Prioritize candidates closest to the user's preferred dimensions
  candidates.sort((a, b) => {
    const distA = Math.abs(item.wPref - a.w) + Math.abs(item.hPref - a.h);
    const distB = Math.abs(item.wPref - b.w) + Math.abs(item.hPref - b.h);
    return distA - distB;
  });

  const uniqueCandidates: { w: number, h: number }[] = [];
  const seen = new Set<string>();
  for (const c of candidates) {
    const key = `${c.w}x${c.h}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCandidates.push(c);
    }
  }

  const prefX = item.rawItem?.prevX ?? item.rawItem?.x ?? 0;
  const prefY = item.rawItem?.prevY ?? item.rawItem?.y ?? 0;

  for (const cand of uniqueCandidates) {
    const positions: { x: number; y: number; dist: number }[] = [];
    for (let y = 0; y <= rows - cand.h; y++) {
      for (let x = 0; x <= cols - cand.w; x++) {
        const dx = x - prefX;
        const dy = y - prefY;
        const dist = dx * dx + dy * dy;
        positions.push({ x, y, dist });
      }
    }
    positions.sort((a, b) => a.dist - b.dist);
    const topPositions = positions.slice(0, 12);

    for (const pos of topPositions) {
      const { x, y } = pos;
      let canFit = true;
      for (let dy = 0; dy < cand.h; dy++) {
        for (let dx = 0; dx < cand.w; dx++) {
          if (grid[y + dy][x + dx] !== null) {
            canFit = false;
            break;
          }
        }
        if (!canFit) break;
      }

      if (canFit) {
        for (let dy = 0; dy < cand.h; dy++) {
          for (let dx = 0; dx < cand.w; dx++) {
            grid[y + dy][x + dx] = item.id;
          }
        }
        placements.set(item.id, { x, y, w: cand.w, h: cand.h });

        solveLayoutPlacementRec(items, grid, itemIndex + 1, cols, rows, placements, solutions, solverState);

        for (let dy = 0; dy < cand.h; dy++) {
          for (let dx = 0; dx < cand.w; dx++) {
            grid[y + dy][x + dx] = null;
          }
        }
        placements.delete(item.id);

        if (solutions.length >= solverState.maxSolutions || solverState.iterations > 2000) {
          return;
        }
      }
    }
  }
}

function solveLayoutPlacement(
  items: any[],
  grid: (string | null)[][],
  itemIndex: number,
  cols: number,
  rows: number,
  placements: Map<string, any>,
  isTall: boolean,
  changedItemId: string | null = null,
  solverState?: { iterations: number }
): boolean {
  if (itemIndex > 0) {
    const solutions: Map<string, any>[] = [];
    const state = { iterations: solverState?.iterations ?? 0, maxSolutions: 1 };
    solveLayoutPlacementRec(items.slice(itemIndex), grid, 0, cols, rows, placements, solutions, state);
    if (solutions.length > 0) {
      for (const [k, v] of solutions[0].entries()) {
        placements.set(k, v);
      }
      return true;
    }
    return false;
  }

  const solutions: Map<string, any>[] = [];
  const state = { iterations: solverState?.iterations ?? 0, maxSolutions: 150 };
  const tempPlacements = new Map<string, any>();
  
  solveLayoutPlacementRec(items, grid, 0, cols, rows, tempPlacements, solutions, state);
  
  if (solverState) {
    solverState.iterations = state.iterations;
  }

  if (solutions.length === 0) {
    return false;
  }

  let bestSolution: Map<string, any> | null = null;
  let bestScore = Infinity;

  const prePlacedItems: any[] = [];
  const foundIds = new Set<string>();
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const id = grid[y][x];
      if (id !== null && !foundIds.has(id)) {
        foundIds.add(id);
        let minX = x, maxX = x, minY = y, maxY = y;
        for (let ty = 0; ty < rows; ty++) {
          for (let tx = 0; tx < cols; tx++) {
            if (grid[ty][tx] === id) {
              minX = Math.min(minX, tx);
              maxX = Math.max(maxX, tx);
              minY = Math.min(minY, ty);
              maxY = Math.max(maxY, ty);
            }
          }
        }
        prePlacedItems.push({
          i: id,
          x: minX,
          y: minY,
          w: maxX - minX + 1,
          h: maxY - minY + 1
        });
      }
    }
  }

  for (const sol of solutions) {
    const candidateLayout: any[] = [...prePlacedItems];
    for (const item of items) {
      const plc = sol.get(item.id)!;
      candidateLayout.push({
        i: item.id,
        x: plc.x,
        y: plc.y,
        w: plc.w,
        h: plc.h
      });
    }

    const expanded = expandLayout(candidateLayout, cols, rows, isTall, changedItemId);
    const emptyCount = countEmptyCells(expanded, cols, rows);

    let distPenalty = 0;
    for (const item of items) {
      const plc = sol.get(item.id)!;
      const prefX = item.rawItem?.prevX ?? item.rawItem?.x ?? 0;
      const prefY = item.rawItem?.prevY ?? item.rawItem?.y ?? 0;
      const dx = plc.x - prefX;
      const dy = plc.y - prefY;
      distPenalty += dx * dx + dy * dy;
    }

    const score = emptyCount * 10000 + distPenalty;
    if (score < bestScore) {
      bestScore = score;
      bestSolution = sol;
    }
  }

  if (bestSolution) {
    for (const [k, v] of bestSolution.entries()) {
      placements.set(k, v);
    }
    return true;
  }

  return false;
}

function packAndFillLayout(
  layout: any[],
  cols: number,
  rows: number,
  changedItem: any | null,
  breakpoint: string,
  activeCards: string[],
  lockedKeys: string[] = []
): any[] {
  console.log("[packAndFillLayout] Input layout:", layout, "activeCards:", activeCards, "changedItem:", changedItem);
  const isTall = activeCards.length < keys.length;

  // Filter only active cards
  const activeLayout = layout.filter(item => activeCards.includes(item.i));

  const fixedItems: any[] = [];
  const flexItems: any[] = [];

  for (const item of activeLayout) {
    const isFixed = lockedKeys.includes(item.i) || (changedItem && item.i === changedItem.i);
    const { minW, maxW } = getCardConstraints(item.i, cols, isTall);
    const { minH, maxH } = getCardHeightConstraints(item.i, isTall);

    // Apply constraints and grid boundaries
    let w = Math.max(minW, Math.min(item.w, cols));
    let h = item.i === "raceControlTicker" ? 1 : Math.max(minH, Math.min(item.h, maxH));
    let x = Math.max(0, Math.min(item.x, cols - w));
    let y = Math.max(0, Math.min(item.y, rows - h));

    const cleanedItem = {
      ...item,
      x,
      y,
      w,
      h,
      minW,
      maxW,
      minH,
      maxH
    };

    if (isFixed) {
      fixedItems.push(cleanedItem);
    } else {
      flexItems.push(cleanedItem);
    }
  }

  // Ensure missing active cards are also included in flexItems
  const presentKeys = new Set(activeLayout.map(item => item.i));
  const missingKeys = activeCards.filter(key => !presentKeys.has(key));
  for (const key of missingKeys) {
    const orig = getOriginalItem(key, breakpoint);
    const { minW, maxW } = getCardConstraints(key, cols, isTall);
    const { minH, maxH } = getCardHeightConstraints(key, isTall);
    const w = orig ? Math.max(minW, Math.min(orig.w, cols)) : minW;
    const h = orig ? Math.max(minH, Math.min(orig.h, maxH)) : minH;
    flexItems.push({
      i: key,
      x: 0,
      y: 0,
      w,
      h,
      minW,
      maxW,
      minH,
      maxH
    });
  }

  // Initialize grid
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  
  // Place fixed items in grid
  for (const item of fixedItems) {
    for (let dy = 0; dy < item.h; dy++) {
      for (let dx = 0; dx < item.w; dx++) {
        if (item.y + dy < rows && item.x + dx < cols) {
          grid[item.y + dy][item.x + dx] = item.i;
        }
      }
    }
  }

  // Sort flexItems: largest preferred area first
  // Sort flexItems: largest preferred area first, but changedItem goes first
  flexItems.sort((a, b) => {
    if (changedItem) {
      if (a.i === changedItem.i) return -1;
      if (b.i === changedItem.i) return 1;
    }
    return (b.w * b.h) - (a.w * a.h);
  });

  // Backtracking search to place flexItems
  const placements = new Map<string, { x: number, y: number, w: number, h: number }>();
  
  let iterations = 0;
  const MAX_ITER = 2000;

  function backtrack(index: number): boolean {
    iterations++;
    if (iterations > MAX_ITER) return false;
    if (index === flexItems.length) return true;
    const item = flexItems[index];

    // Generate candidate sizes: try preferred size down to minimum size
    const sizeCandidates: { w: number, h: number }[] = [];
    for (let currentH = item.h; currentH >= item.minH; currentH--) {
      for (let currentW = item.w; currentW >= item.minW; currentW--) {
        sizeCandidates.push({ w: currentW, h: currentH });
      }
    }
    
    // Sort candidates so that we try sizes closest to preferred size (by area) first
    sizeCandidates.sort((a, b) => {
      const areaA = a.w * a.h;
      const areaB = b.w * b.h;
      return areaB - areaA;
    });

    for (const size of sizeCandidates) {
      const { w, h } = size;

      // Find all valid positions in the grid
      const positions: { x: number, y: number, dist: number }[] = [];
      for (let y = 0; y <= rows - h; y++) {
        for (let x = 0; x <= cols - w; x++) {
          let canFit = true;
          for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
              if (grid[y + dy][x + dx] !== null) {
                canFit = false;
                break;
              }
            }
            if (!canFit) break;
          }
          if (canFit) {
            const dx = x - item.x;
            const dy = y - item.y;
            positions.push({ x, y, dist: dx * dx + dy * dy });
          }
        }
      }

      // Sort positions by proximity to original coordinates and take top 4
      positions.sort((a, b) => a.dist - b.dist);
      const topPositions = positions.slice(0, 4);

      for (const pos of topPositions) {
        const { x, y } = pos;

        // Fill grid
        for (let dy = 0; dy < h; dy++) {
          for (let dx = 0; dx < w; dx++) {
            grid[y + dy][x + dx] = item.i;
          }
        }
        placements.set(item.i, { x, y, w, h });

        if (backtrack(index + 1)) return true;

        // Undo placement
        for (let dy = 0; dy < h; dy++) {
          for (let dx = 0; dx < w; dx++) {
            grid[y + dy][x + dx] = null;
          }
        }
        placements.delete(item.i);
      }
    }

    return false;
  }

  const success = backtrack(0);

  // Build final layout array
  const resultLayout: any[] = [];
  
  if (success) {
    // Add fixed items
    for (const item of fixedItems) {
      resultLayout.push({
        i: item.i, x: item.x, y: item.y, w: item.w, h: item.h,
        minW: item.minW, maxW: item.maxW, minH: item.minH, maxH: item.maxH,
        static: lockedKeys.includes(item.i) ? true : undefined
      });
    }

    // Add flex items using placements
    for (const item of flexItems) {
      const plc = placements.get(item.i)!;
      resultLayout.push({
        i: item.i, x: plc.x, y: plc.y, w: plc.w, h: plc.h,
        minW: item.minW, maxW: item.maxW, minH: item.minH, maxH: item.maxH,
        static: lockedKeys.includes(item.i) ? true : undefined
      });
    }
  } else {
    // FORCE FIT FALLBACK: Shrink all flex items and place greedily to avoid overlaps at all costs
    console.warn("[packAndFillLayout] Backtrack failed or timed out. Forcing minimum size layout.");
    const forceGrid = Array.from({ length: rows }, () => Array(cols).fill(null));
    const allItems = [...fixedItems, ...flexItems].sort((a, b) => (b.minW * b.minH) - (a.minW * a.minH));
    
    for (const item of allItems) {
      let placed = false;
      for (let y = 0; y <= rows - item.minH; y++) {
        for (let x = 0; x <= cols - item.minW; x++) {
          let fits = true;
          for (let dy = 0; dy < item.minH; dy++) {
            for (let dx = 0; dx < item.minW; dx++) {
              if (forceGrid[y+dy][x+dx] !== null) { fits = false; break; }
            }
            if (!fits) break;
          }
          if (fits) {
            for (let dy = 0; dy < item.minH; dy++) {
              for (let dx = 0; dx < item.minW; dx++) {
                forceGrid[y+dy][x+dx] = item.i;
              }
            }
            resultLayout.push({
              i: item.i, x, y, w: item.minW, h: item.minH,
              minW: item.minW, maxW: item.maxW, minH: item.minH, maxH: item.maxH,
              static: lockedKeys.includes(item.i) ? true : undefined
            });
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
      if (!placed) {
        // Absolute fallback if mathematically impossible
        resultLayout.push({
          i: item.i, x: 0, y: 0, w: item.minW, h: item.minH,
          minW: item.minW, maxW: item.maxW, minH: item.minH, maxH: item.maxH,
          static: lockedKeys.includes(item.i) ? true : undefined
        });
      }
    }
  }

  const expandedLayout = expandLayout(resultLayout, cols, rows, isTall, changedItem ? changedItem.i : null, lockedKeys);
  console.log("[packAndFillLayout] Result (at rows=" + rows + "):", expandedLayout);
  return expandedLayout;
}

export const CARD_STYLE_BLACK = "bg-[#0c0c0f] text-white";
export const CARD_STYLE_RED = "bg-[#e8002d] text-white";
export const CARD_STYLE_OFF_WHITE = "bg-[#e0e0e0] text-[#121212]";

const GridItemWrapper = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { style, className, cardKey, isLocked, getCardStyle, toggleLock, renderBackgroundIcon, renderCardContent, children, ...rest } = props;
  
  const finalStyle = cardKey === "pitStopStrategy" 
    ? { ...style, border: "none", borderWidth: "0px", boxShadow: "none", outline: "none", background: "transparent" }
    : style;

  return (
    <div
      ref={ref}
      style={finalStyle}
      className={`group card-container relative flex flex-col ${cardKey !== "pitStopStrategy" ? "shadow-xl border border-white/5 rounded-[10px]" : "border-0 border-transparent shadow-none bg-transparent outline-none"} overflow-hidden select-none ${getCardStyle(cardKey)} ${cardKey !== "liveReplay" && !isLocked ? "drag-handle cursor-grab active:cursor-grabbing" : ""} ${cardKey !== "liveReplay" && cardKey !== "raceControlTicker" && cardKey !== "pitStopStrategy" ? "p-4 sm:p-5" : ""} ${className || ""}`}
      {...rest}
    >
      {cardKey !== "liveReplay" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLock(cardKey);
          }}
          className={`absolute top-2 right-2 z-40 p-1.5 rounded bg-[#121212]/95 border border-white/10 hover:border-primary/60 hover:text-white transition-all shadow-md pointer-events-auto ${isLocked ? "opacity-100 text-primary border-primary/40" : "opacity-0 group-hover:opacity-100 text-white/50"}`}
          title={isLocked ? "Unlock Position & Size" : "Lock Position & Size"}
        >
          {isLocked ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <Unlock className="w-3.5 h-3.5" />
          )}
        </button>
      )}
      {renderBackgroundIcon(cardKey)}
      {renderCardContent(cardKey)}
      {children}
    </div>
  );
});
GridItemWrapper.displayName = "GridItemWrapper";

export default function Layout(props: any) {
  const { 
    viewMode, setViewMode, 
    telemetryOpacity, setTelemetryOpacity, 
    selectedDriver, setSelectedDriver, 
    comparisonDriver, setComparisonDriver, 
    selectedIncident, setSelectedIncident,
    raceResults, grid, DRIVERS,
    activeCards = keys,
    layoutPreset = 0
  } = props;

  const selectedZone = useReplay((s) => s.selectedZone);

  const [lockedKeys, setLockedKeys] = useState<string[]>([]);
  const [playbackHovered, setPlaybackHovered] = useState(false);
  const [isDraggingActive, setIsDraggingActive] = useState(false);

  const toggleLock = (key: string) => {
    setLockedKeys(prev => {
      const isLocked = prev.includes(key);
      const next = isLocked ? prev.filter(k => k !== key) : [...prev, key];
      return next;
    });
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);

  const [layouts, setLayouts] = useState<Layouts>(() => {
    const activeUnscaled = AboutLayout.lg.filter(item => activeCards.includes(item.i));
    return {
      lg: packAndFillLayout(activeUnscaled, 8, 12, null, "lg", activeCards),
      xs: AboutLayout.xs
    };
  });

  const processedLayouts = useMemo(() => {
    const isLiveReplayLocked = lockedKeys.includes("liveReplay");
    const isLiveReplayDraggable = !isLiveReplayLocked && (playbackHovered || isDraggingActive);
    const isTall = activeCards.length < keys.length;

    const lg = (layouts.lg || []).map(item => {
      const isLocked = lockedKeys.includes(item.i);
      const { minW, maxW } = getCardConstraints(item.i, COLS, isTall);
      const { minH, maxH } = getCardHeightConstraints(item.i, isTall);
      return {
        ...item,
        isDraggable: item.i === "liveReplay" ? isLiveReplayDraggable : (!isLocked),
        isResizable: item.i === "pitStopStrategy" ? false : !isLocked,
        minW: item.i === "pitStopStrategy" ? 1 : minW,
        maxW: item.i === "pitStopStrategy" ? 1 : maxW,
        minH,
        maxH,
        static: isLocked ? true : undefined
      };
    });

    const xs = (layouts.xs || []).map(item => {
      const isLocked = lockedKeys.includes(item.i);
      return {
        ...item,
        isDraggable: isLiveReplayDraggable,
        isResizable: !isLocked,
        minW: 1,
        maxW: 1,
        minH: 1,
        maxH: ROWS,
        static: true
      };
    });

    return { lg, xs };
  }, [layouts, playbackHovered, isDraggingActive, lockedKeys, activeCards]);

  const [gridKey, setGridKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const prevPresetRef = useRef(layoutPreset);

  useEffect(() => {
    const presetChanged = prevPresetRef.current !== layoutPreset;
    prevPresetRef.current = layoutPreset;

    setLayouts(prev => {
      let baseUnscaledLg = AboutLayout.lg;
      if (presetChanged) {
        if (layoutPreset === 1) {
          baseUnscaledLg = [
            { i: "liveReplay",               x: 0, y: 0, w: 3, h: 8 },
            { i: "telemetry",                x: 3, y: 0, w: 5, h: 4 },
            { i: "driverHeadToHead",         x: 3, y: 4, w: 5, h: 4 },
            { i: "raceControlTicker",        x: 0, y: 8, w: 3, h: 1 },
            { i: "liveOrder",                x: 0, y: 9, w: 3, h: 3 },
            { i: "driversChampionship",      x: 3, y: 8, w: 2, h: 4 },
            { i: "pitStopStrategy",          x: 5, y: 8, w: 3, h: 4 },
          ];
        } else if (layoutPreset === 2) {
          baseUnscaledLg = [
            { i: "liveOrder",                x: 0, y: 0, w: 3, h: 8 },
            { i: "driversChampionship",      x: 0, y: 8, w: 3, h: 4 },
            { i: "liveReplay",               x: 3, y: 0, w: 5, h: 6 },
            { i: "raceControlTicker",        x: 3, y: 6, w: 5, h: 1 },
            { i: "constructorsChampionship", x: 3, y: 7, w: 2, h: 5 },
            { i: "raceSummary",              x: 5, y: 7, w: 1, h: 5 },
            { i: "circuitSpecs",             x: 6, y: 7, w: 2, h: 5 },
          ];
        } else if (layoutPreset === 3) {
          baseUnscaledLg = [
            { i: "liveReplay",               x: 0, y: 0, w: 4, h: 6 },
            { i: "lapTiming",                x: 4, y: 0, w: 4, h: 6 },
            { i: "telemetry",                x: 0, y: 6, w: 4, h: 4 },
            { i: "raceControlTicker",        x: 0, y: 10, w: 4, h: 2 },
            { i: "driverHeadToHead",         x: 4, y: 6, w: 4, h: 6 },
          ];
        } else {
          baseUnscaledLg = AboutLayout.lg;
        }
      } else {
        baseUnscaledLg = prev.lg || [];
      }

      const activeUnscaled = baseUnscaledLg.filter(item => activeCards.includes(item.i));
      const filledUnscaled = packAndFillLayout(activeUnscaled, 8, 12, null, "lg", activeCards, lockedKeys);
      
      return {
        lg: filledUnscaled,
        xs: AboutLayout.xs
      };
    });
    setGridKey(k => k + 1);
  }, [activeCards, layoutPreset]);

  const rowHeight = dimensions.height > 0 ? Math.max(1, (dimensions.height - 176) / 12) : 63;

  const handleDrag = () => {
    setIsDraggingActive(true);
  };

  const handleResize = () => {
    setIsDraggingActive(true);
  };

  const handleDragStop = (currentLayout: any[], oldItem: any, newItem: any) => {
    setIsDraggingActive(false);
    const packed = packAndFillLayout(currentLayout, COLS, ROWS, newItem, "lg", activeCards, lockedKeys);
    setLayouts(prev => ({ ...prev, lg: packed }));
    setGridKey(k => k + 1);
  };

  const handleResizeStop = (currentLayout: any[], oldItem: any, newItem: any) => {
    setIsDraggingActive(false);
    const packed = packAndFillLayout(currentLayout, COLS, ROWS, newItem, "lg", activeCards, lockedKeys);
    setLayouts(prev => ({ ...prev, lg: packed }));
    setGridKey(k => k + 1);
  };

  const renderCardContent = (key: string) => {
    switch(key) {
      case "liveOrder":
        return <DriverStandings />;
      case "driversChampionship":
        return <DriverChampionship />;
      case "constructorsChampionship":
        return <ConstructorStandings />;
      case "lapTiming":
        return <LapTimingChart />;
      case "liveReplay":
        return (
          <div className="relative w-full h-full flex flex-col min-h-0 bg-[#08080a]">
            <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1 bg-[#121212]/95 backdrop-blur-md p-1 rounded-md border border-white/10 pointer-events-auto shadow-lg no-drag">
                {(["replay", "spatial", "telemetry", "comparison", "incidents"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => { setViewMode(m); if (m !== "incidents") setSelectedIncident(null); }}
                    className={`px-3 py-1.5 text-[9px] tracking-widest uppercase font-bold transition-all rounded-sm ${viewMode === m ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-white"}`}
                  >
                    {m === "replay" ? "Live Replay" : m}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                <div 
                  onMouseEnter={() => { if (viewMode !== "replay") setPlaybackHovered(true); }}
                  onMouseLeave={() => { if (viewMode !== "replay") setPlaybackHovered(false); }}
                  className={`bg-[#121212]/95 backdrop-blur-md px-3 py-2 rounded-md border border-white/10 shadow-lg font-semibold text-[9px] tracking-[0.2em] uppercase text-muted-foreground ${viewMode !== "replay" && !lockedKeys.includes("liveReplay") ? "drag-handle cursor-grab active:cursor-grabbing" : ""}`}
                >
                  {viewMode === 'replay' ? 'Monaco GP · Live Centerline 3D' : 
                   viewMode === 'spatial' ? 'Circuit de Monaco · Spatial 3D' :
                   viewMode === 'telemetry' ? `${selectedDriver} Speed Telemetry` :
                   viewMode === 'comparison' ? `${selectedDriver} vs ${comparisonDriver || 'Compare'} dominance` :
                   'Circuit de Monaco · Race Incidents Board'}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock("liveReplay");
                  }}
                  className={`p-2 rounded bg-[#121212]/95 backdrop-blur-md border border-white/10 hover:border-primary/60 hover:text-white transition-all shadow-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${lockedKeys.includes("liveReplay") ? "text-primary border-primary/40" : "text-white/50"}`}
                  title={lockedKeys.includes("liveReplay") ? "Unlock Position & Size" : "Lock Position & Size"}
                >
                  {lockedKeys.includes("liveReplay") ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative w-full h-full min-h-0 no-drag">
              <ErrorBoundary fallback={
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-[#0c0c0f]/80 border border-white/5">
                  <div className="text-[#e8002d] text-[10px] font-bold tracking-[2px] uppercase mb-1.5">3D Viewport Offline</div>
                  <p className="text-[10px] text-white/50 max-w-[240px] leading-relaxed mb-3">
                    The 3D model could not be loaded. Please run the dashboard from a local web server or place the assets in the parent directory.
                  </p>
                </div>
              }>
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground tracking-widest uppercase">Loading Scene...</div>}>
                  <Track3D />
                </Suspense>
              </ErrorBoundary>
            </div>

            {viewMode === "replay" && (
              <div 
                onMouseEnter={() => setPlaybackHovered(true)}
                onMouseLeave={() => setPlaybackHovered(false)}
                className={`border-t border-white/5 bg-[#0c0c0f] py-3 px-4 shrink-0 pointer-events-auto ${!lockedKeys.includes("liveReplay") ? "drag-handle cursor-grab active:cursor-grabbing" : ""}`}
              >
                <PlaybackBar />
              </div>
            )}
          </div>
        );
      case "circuitSpecs":
        return <CircuitSpecs viewMode={viewMode} selectedIncident={selectedIncident} setSelectedIncident={setSelectedIncident} raceResults={raceResults} />;
      case "raceSummary":
        return <RaceSummary raceResults={raceResults} grid={grid} />;
      case "telemetry":
        return (
          <div className="flex flex-col h-full justify-center relative">
            {(viewMode === "replay" || viewMode === "telemetry" || viewMode === "comparison") ? (
              <div className="flex items-center justify-between gap-6 h-full w-full telemetry-layout-container">
                <div className="flex-1 min-w-0">
                  <Telemetry />
                </div>

                {(viewMode === "telemetry" || viewMode === "comparison") && (
                  <div className="w-[240px] shrink-0 bg-white/5 p-2.5 rounded-lg border border-white/10 flex flex-col justify-between h-full telemetry-settings-panel pointer-events-auto shadow-md">
                    <div className="space-y-2">
                      <div>
                        <div className="text-[8px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 leading-none">Driver 1</div>
                        <select 
                          value={selectedDriver}
                          onChange={(e) => setSelectedDriver(e.target.value)}
                          className="w-full bg-[#121212] border border-white/10 px-2 py-1 text-[11px] rounded text-white font-bold focus:outline-none focus:border-primary"
                        >
                          {DRIVERS.map((d: string) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>

                      {viewMode === "comparison" && (
                        <div>
                          <div className="text-[8px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 leading-none">Driver 2</div>
                          <select 
                            value={comparisonDriver || ""}
                            onChange={(e) => setComparisonDriver(e.target.value || null)}
                            className="w-full bg-[#121212] border border-white/10 px-2 py-1 text-[11px] rounded text-white font-bold focus:outline-none focus:border-primary"
                          >
                            <option value="">Select driver...</option>
                            {DRIVERS.filter((d: string) => d !== selectedDriver).map((d: string) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="pt-1.5 border-t border-white/5">
                      <div className="flex justify-between items-center mb-1 leading-none">
                        <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-widest">Opacity</span>
                        <span className="text-[9px] font-bold text-white mono">{telemetryOpacity}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={telemetryOpacity}
                        onChange={(e) => setTelemetryOpacity(Number(e.target.value))}
                        className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (viewMode === "incidents" && selectedIncident) ? (
              <IncidentTelemetry incident={selectedIncident} />
            ) : (viewMode === "spatial" && selectedZone) ? (
              <ZoneTelemetry zoneId={selectedZone} />
            ) : (
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <div className="uppercase tracking-[0.2em] font-semibold text-[12px] mb-2 text-white flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" /> Mode Settings
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed max-w-sm">
                    {viewMode === "spatial" && "Interact with the high fidelity 3D layout of Circuit de Monaco. Drag to rotate, scroll to zoom. The layout is accurately scaled to real-world dimensions."}
                    {viewMode === "incidents" && "Inspect historical events during the Monaco GP 2024. Click on any colored sphere in the 3D map to view full telemetry statistics and impact details."}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      case "raceControlTicker":
        return <RaceControlTicker />;
      case "pitStopStrategy":
        return <PitStopStrategy />;
      case "driverHeadToHead":
        return <DriverHeadToHead />;
      case "teamComparison":
        return <TeamComparison />;
      default:
        return null;
    }
  };

  const getCardStyle = (key: string) => {
    switch(key) {
      case "liveOrder": return CARD_STYLE_RED;
      case "driversChampionship": return CARD_STYLE_OFF_WHITE;
      case "constructorsChampionship": return CARD_STYLE_BLACK;
      case "lapTiming": return CARD_STYLE_OFF_WHITE;
      case "liveReplay": return "bg-[#08080a] text-white";
      case "circuitSpecs": return CARD_STYLE_OFF_WHITE;
      case "raceSummary": return CARD_STYLE_RED;
      case "telemetry": return CARD_STYLE_BLACK;
      case "raceControlTicker": return CARD_STYLE_BLACK;
      case "pitStopStrategy": return "bg-transparent text-white";
      case "driverHeadToHead": return CARD_STYLE_OFF_WHITE;
      case "teamComparison": return CARD_STYLE_BLACK;
      default: return "";
    }
  };

  const renderBackgroundIcon = (key: string) => {
    const iconClass = "absolute top-0 right-0 p-8 opacity-[0.06] pointer-events-none rotate-12 scale-150 w-48 h-48";
    switch(key) {
      case "liveOrder":
        return <Flag className={iconClass} />;
      case "driversChampionship":
        return <Trophy className={iconClass} />;
      case "constructorsChampionship":
        return <Wrench className={iconClass} />;
      case "lapTiming":
        return <Timer className={iconClass} />;
      case "circuitSpecs":
        return <LucideMap className={iconClass} />;
      case "raceSummary":
        return <Trophy className={iconClass} />;
      case "telemetry":
        return <Gauge className={iconClass} />;
      case "raceControlTicker":
        return <AlertCircle className={iconClass} />;
      case "pitStopStrategy":
        return null;
      case "driverHeadToHead":
        return <Zap className={iconClass} />;
      case "teamComparison":
        return <Users className={iconClass} />;
      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full p-4 border border-white/10 rounded-[16px] bg-[#08080a]/30 backdrop-blur-sm overflow-hidden"
      style={{
        boxSizing: "border-box",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {mounted && dimensions.width > 0 && dimensions.height > 0 && (
        <Responsive
          width={dimensions.width}
          className="m-auto flex-1" 
          style={{
            width: `${dimensions.width}px`,
            minHeight: `${dimensions.height}px`,
            overflow: "visible"
          }}
          isDraggable={true}
          isResizable={true}
          isBounded={true}
          draggableHandle=".drag-handle"
          handle=".drag-handle"
          draggableCancel="button, input, select, textarea, a, canvas, .interactive-element, .map-container, .chart-container, .no-drag, .no-drag *"
          cancel="button, input, select, textarea, a, canvas, .interactive-element, .map-container, .chart-container, .no-drag, .no-drag *"
          breakpoints={{ lg: 0 }}
          cols={{ lg: COLS }}
          rowHeight={rowHeight}
          layouts={processedLayouts}
          compactType="vertical"
          maxRows={12}
          onDrag={handleDrag}
          onResize={handleResize}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {activeCards.map((key) => {
            const isLocked = lockedKeys.includes(key);
            return (
              <GridItemWrapper
                key={key}
                cardKey={key}
                isLocked={isLocked}
                getCardStyle={getCardStyle}
                toggleLock={toggleLock}
                renderBackgroundIcon={renderBackgroundIcon}
                renderCardContent={renderCardContent}
              />
            );
          })}
        </Responsive>
      )}
    </div>
  );
}
