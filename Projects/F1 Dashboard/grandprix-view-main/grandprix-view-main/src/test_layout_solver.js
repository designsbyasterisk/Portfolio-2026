const COLS = 8;
const ROWS = 12;

const AboutLayout = {
  lg: [
    { i: "liveReplay",               x: 2, y: 0, w: 4, h: 8 },
    { i: "telemetry",                x: 2, y: 8, w: 4, h: 3 },
    { i: "raceControlTicker",        x: 2, y: 11, w: 4, h: 1 },
    { i: "liveOrder",                x: 0, y: 0, w: 2, h: 4 },
    { i: "driversChampionship",      x: 0, y: 4, w: 2, h: 4 },
    { i: "constructorsChampionship", x: 0, y: 8, w: 1, h: 4 },
    { i: "raceSummary",              x: 1, y: 8, w: 1, h: 4 },
    { i: "lapTiming",                x: 6, y: 0, w: 2, h: 4 },
    { i: "circuitSpecs",             x: 6, y: 4, w: 2, h: 4 },
    { i: "pitStopStrategy",          x: 6, y: 8, w: 1, h: 4 },
    { i: "driverHeadToHead",         x: 7, y: 8, w: 1, h: 4 },
    { i: "teamComparison",           x: 0, y: 4, w: 2, h: 4 }
  ]
};

function getOriginalItem(id) {
  return AboutLayout.lg.find(item => item.i === id);
}

function getCardConstraints(id, cols, isTall) {
  if (id === "pitStopStrategy") return { minW: 1, maxW: 1 };
  switch (id) {
    case "liveReplay": return { minW: 4, maxW: isTall ? 8 : 4 };
    case "telemetry": return { minW: 2, maxW: isTall ? 8 : 4 };
    case "raceControlTicker": return { minW: 2, maxW: 8 };
    case "constructorsChampionship":
    case "raceSummary":
    case "driverHeadToHead": return { minW: 1, maxW: isTall ? 4 : 2 };
    default: return { minW: 2, maxW: isTall ? 8 : 4 };
  }
}

function tryExpandLeft(layout, grid, x, y, cols) {
  if (x <= 0) return false;
  const leftItemId = grid[y][x - 1];
  if (!leftItemId) return false;
  const item = layout.find(i => i.i === leftItemId);
  if (!item) return false;

  const targetX = item.x + item.w;
  if (targetX >= cols) return false;

  for (let ty = item.y; ty < item.y + item.h; ty++) {
    if (ty >= grid.length) return false;
    if (grid[ty][targetX] !== null && grid[ty][targetX] !== leftItemId) return false;
  }
  item.w += 1;
  return true;
}

function tryExpandRight(layout, grid, x, y, cols) {
  if (x >= cols - 1) return false;
  const rightItemId = grid[y][x + 1];
  if (!rightItemId) return false;
  const item = layout.find(i => i.i === rightItemId);
  if (!item) return false;

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

function tryExpandTop(layout, grid, x, y) {
  if (y <= 0) return false;
  const topItemId = grid[y - 1][x];
  if (!topItemId) return false;
  const item = layout.find(i => i.i === topItemId);
  if (!item) return false;

  const targetY = item.y + item.h;
  if (targetY >= grid.length) return false;

  for (let tx = item.x; tx < item.x + item.w; tx++) {
    if (grid[targetY][tx] !== null && grid[targetY][tx] !== topItemId) return false;
  }
  item.h += 1;
  return true;
}

function tryExpandBottom(layout, grid, x, y) {
  if (y >= grid.length - 1) return false;
  const bottomItemId = grid[y + 1][x];
  if (!bottomItemId) return false;
  const item = layout.find(i => i.i === bottomItemId);
  if (!item) return false;

  const targetY = item.y - 1;
  if (targetY < 0) return false;

  for (let tx = item.x; tx < item.x + item.w; tx++) {
    if (grid[targetY][tx] !== null && grid[targetY][tx] !== bottomItemId) return false;
  }
  item.y -= 1;
  item.h += 1;
  return true;
}

function expandLayout(layout, cols, rows) {
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
          if (tryExpandLeft(cloned, currentGrid, x, y, cols) ||
              tryExpandRight(cloned, currentGrid, x, y, cols) ||
              tryExpandTop(cloned, currentGrid, x, y) ||
              tryExpandBottom(cloned, currentGrid, x, y)) {
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

function countEmptyCells(layout, cols, rows) {
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

// Old Solver
function solveLayoutPlacementOld(
  items,
  grid,
  itemIndex,
  cols,
  rows,
  placements,
  solverState
) {
  if (solverState) {
    solverState.iterations++;
    if (solverState.iterations > 1000) return false;
  }
  if (itemIndex === items.length) return true;

  const item = items[itemIndex];
  const minW = item.minW ?? 1;
  const candidates = [];
  const startW = Math.max(item.wPref, minW);
  for (let w = startW; w >= minW; w--) {
    candidates.push({ w, h: item.hPref });
  }

  const uniqueCandidates = [];
  const seen = new Set();
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
    const positions = [];
    for (let y = 0; y <= rows - cand.h; y++) {
      for (let x = 0; x <= cols - cand.w; x++) {
        const dx = x - prefX;
        const dy = y - prefY;
        const dist = dx * dx + dy * dy;
        positions.push({ x, y, dist });
      }
    }
    positions.sort((a, b) => a.dist - b.dist);

    for (const pos of positions) {
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

        if (solveLayoutPlacementOld(items, grid, itemIndex + 1, cols, rows, placements, solverState)) {
          return true;
        }

        for (let dy = 0; dy < cand.h; dy++) {
          for (let dx = 0; dx < cand.w; dx++) {
            grid[y + dy][x + dx] = null;
          }
        }
        placements.delete(item.id);
      }
    }
  }
  return false;
}

// New Solver
function solveLayoutPlacementAll(
  items,
  grid,
  itemIndex,
  cols,
  rows,
  placements,
  results,
  solverState
) {
  solverState.iterations++;
  if (solverState.iterations > 2000) return;
  if (results.length >= solverState.maxSolutions) return;

  if (itemIndex === items.length) {
    results.push(new Map(placements));
    return;
  }

  const item = items[itemIndex];
  const minW = item.minW ?? 1;
  const candidates = [];
  const startW = Math.max(item.wPref, minW);
  for (let w = startW; w >= minW; w--) {
    candidates.push({ w, h: item.hPref });
  }

  const uniqueCandidates = [];
  const seen = new Set();
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
    const positions = [];
    for (let y = 0; y <= rows - cand.h; y++) {
      for (let x = 0; x <= cols - cand.w; x++) {
        const dx = x - prefX;
        const dy = y - prefY;
        const dist = dx * dx + dy * dy;
        positions.push({ x, y, dist });
      }
    }
    positions.sort((a, b) => a.dist - b.dist);

    for (const pos of positions) {
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

        solveLayoutPlacementAll(items, grid, itemIndex + 1, cols, rows, placements, results, solverState);

        for (let dy = 0; dy < cand.h; dy++) {
          for (let dx = 0; dx < cand.w; dx++) {
            grid[y + dy][x + dx] = null;
          }
        }
        placements.delete(item.id);

        if (results.length >= solverState.maxSolutions || solverState.iterations > 2000) {
          return;
        }
      }
    }
  }
}

// Simulate packAndFillLayout using old solver vs new solver
function runSimulation(useNewSolver) {
  // Let's set up active cards like in the screenshot
  const activeCards = [
    "liveReplay",
    "telemetry",
    "teamComparison",   // Teammate Battle
    "pitStopStrategy",  // Tyre card
    "raceSummary",
    "lapTiming"
  ];

  // Set up their current positions based on the user screenshot
  // 1. lapTiming was moved/resized: x:2, y:8, w:2, h:4 (clamped changedItem)
  const clampedChangedItem = { i: "lapTiming", x: 2, y: 8, w: 2, h: 4 };

  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  const newLayoutMap = new Map();

  // Place clamped changedItem
  newLayoutMap.set(clampedChangedItem.i, clampedChangedItem);
  for (let dy = 0; dy < clampedChangedItem.h; dy++) {
    for (let dx = 0; dx < clampedChangedItem.w; dx++) {
      grid[clampedChangedItem.y + dy][clampedChangedItem.x + dx] = clampedChangedItem.i;
    }
  }

  // Set up other items with their previous locations (from simulation of user placing them)
  const layout = [
    { i: "liveReplay", x: 0, y: 0, w: 4, h: 8 },
    { i: "telemetry", x: 4, y: 0, w: 4, h: 3 },
    { i: "teamComparison", x: 4, y: 3, w: 4, h: 5 }, // Teammate Battle (height 5)
    { i: "pitStopStrategy", x: 0, y: 8, w: 1, h: 4 }, // Tyre card
    { i: "raceSummary", x: 1, y: 8, w: 1, h: 4 },
    { i: "lapTiming", x: 2, y: 8, w: 2, h: 4 }
  ];

  const remainingItems = activeCards
    .filter(id => id !== clampedChangedItem.i)
    .map(id => {
      const currentItem = layout.find(item => item.i === id);
      const orig = getOriginalItem(id);
      const w = currentItem ? currentItem.w : (orig ? orig.w : 1);
      const h = id === "raceControlTicker" ? 1 : (currentItem ? currentItem.h : (orig ? orig.h : 1));
      const x = currentItem ? currentItem.x : (orig ? orig.x : 0);
      const y = currentItem ? currentItem.y : (orig ? orig.y : 0);
      return { i: id, x, y, w, h, prevX: x, prevY: y, prevW: w, prevH: h };
    });

  // Sort remaining items by area descending
  remainingItems.sort((a, b) => {
    const origA = getOriginalItem(a.i);
    const origB = getOriginalItem(b.i);
    const areaA = origA ? origA.w * origA.h : (a.w * a.h || 1);
    const areaB = origB ? origB.w * origB.h : (b.w * b.h || 1);
    return areaB - areaA;
  });

  const isTall = activeCards.length < 12;
  const itemsToPlace = remainingItems.map(item => {
    const orig = getOriginalItem(item.i);
    const { minW } = getCardConstraints(item.i, COLS, isTall);
    return {
      id: item.i,
      wPref: orig ? orig.w : item.w,
      hPref: orig ? orig.h : item.h,
      minW,
      rawItem: item
    };
  });

  if (!useNewSolver) {
    const placements = new Map();
    const success = solveLayoutPlacementOld(itemsToPlace, grid, 0, COLS, ROWS, placements, { iterations: 0 });
    if (success) {
      for (const item of itemsToPlace) {
        const plc = placements.get(item.id);
        newLayoutMap.set(item.id, { ...item.rawItem, x: plc.x, y: plc.y, w: plc.w, h: plc.h });
      }
      console.log("OLD SOLVER BEFORE EXPANSION:");
      printLayoutAndGrid(Array.from(newLayoutMap.values()));
      const expanded = expandLayout(Array.from(newLayoutMap.values()), COLS, ROWS);
      console.log("OLD SOLVER RESULT:");
      printLayoutAndGrid(expanded);
    } else {
      console.log("OLD SOLVER FAILED");
    }
  } else {
    // New solver
    const solutions = [];
    const solverState = { iterations: 0, maxSolutions: 150 };
    const placements = new Map();
    solveLayoutPlacementAll(itemsToPlace, grid, 0, COLS, ROWS, placements, solutions, solverState);
    console.log("NEW SOLVER ITERATIONS:", solverState.iterations);

    if (solutions.length > 0) {
      let bestLayout = null;
      let bestScore = Infinity;
      let bestEmptyCount = Infinity;
      let bestBeforeExpansion = null;

      for (const sol of solutions) {
        const candidateLayout = [];
        candidateLayout.push(clampedChangedItem);
        for (const itemToPlace of itemsToPlace) {
          const plc = sol.get(itemToPlace.id);
          candidateLayout.push({ ...itemToPlace.rawItem, x: plc.x, y: plc.y, w: plc.w, h: plc.h });
        }

        const expanded = expandLayout(candidateLayout, COLS, ROWS);
        const emptyCount = countEmptyCells(expanded, COLS, ROWS);

        let distPenalty = 0;
        for (const itemToPlace of itemsToPlace) {
          const plc = sol.get(itemToPlace.id);
          const prefX = itemToPlace.rawItem.prevX;
          const prefY = itemToPlace.rawItem.prevY;
          const dx = plc.x - prefX;
          const dy = plc.y - prefY;
          distPenalty += dx * dx + dy * dy;
        }

        const score = emptyCount * 10000 + distPenalty;
        if (score < bestScore) {
          bestScore = score;
          bestLayout = expanded;
          bestEmptyCount = emptyCount;
          bestBeforeExpansion = candidateLayout;
        }
      }

      console.log("NEW SOLVER BEFORE EXPANSION:");
      printLayoutAndGrid(bestBeforeExpansion);
      console.log("NEW SOLVER RESULT (Best empty count:", bestEmptyCount, "):");
      printLayoutAndGrid(bestLayout);
    } else {
      console.log("NEW SOLVER FAILED");
    }
  }
}

function printLayoutAndGrid(layout) {
  const finalGrid = Array.from({ length: ROWS }, () => Array(COLS).fill("   .   "));
  const nameMap = {
    liveReplay: "Replay ",
    telemetry: "Telem  ",
    liveOrder: "Order  ",
    lapTiming: "Laps   ",
    circuitSpecs: "Specs  ",
    driverHeadToHead: "Head2H ",
    teamComparison: "Battle ",
    raceSummary: "Summ   ",
    pitStopStrategy: "Tyre   ",
    raceControlTicker: "Ticker "
  };

  for (const item of layout) {
    const name = nameMap[item.i] || item.i.substring(0, 7).padEnd(7);
    for (let dy = 0; dy < item.h; dy++) {
      for (let dx = 0; dx < item.w; dx++) {
        if (item.y + dy < ROWS && item.x + dx < COLS) {
          finalGrid[item.y + dy][item.x + dx] = name;
        }
      }
    }
  }

  for (let y = 0; y < ROWS; y++) {
    console.log(`Row ${String(y).padStart(2)}: ` + finalGrid[y].join("|"));
  }
  console.log("");
}

console.log("Running old solver simulation...");
runSimulation(false);

console.log("Running new solver simulation...");
runSimulation(true);
