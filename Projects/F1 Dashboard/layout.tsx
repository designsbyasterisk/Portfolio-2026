import { useMemo, useState } from "react";
import { Responsive, WidthProvider, Layouts } from "react-grid-layout";
import { AboutLayout, keys } from "../utils/layout.helper";

function tryExpandLeft(layout: any[], grid: (string | null)[][], x: number, y: number, cols: number): boolean {
  if (x <= 0) return false;
  const leftItemId = grid[y][x - 1];
  if (!leftItemId) return false;
  const item = layout.find(i => i.i === leftItemId);
  if (!item) return false;

  const targetX = item.x + item.w;
  if (targetX >= cols) return false;

  // Check if target column is empty for the item's entire height
  for (let ty = item.y; ty < item.y + item.h; ty++) {
    if (ty >= grid.length) return false;
    if (grid[ty][targetX] !== null && grid[ty][targetX] !== leftItemId) {
      return false;
    }
  }

  item.w += 1;
  return true;
}

function tryExpandRight(layout: any[], grid: (string | null)[][], x: number, y: number, cols: number): boolean {
  if (x >= cols - 1) return false;
  const rightItemId = grid[y][x + 1];
  if (!rightItemId) return false;
  const item = layout.find(i => i.i === rightItemId);
  if (!item) return false;

  const targetX = item.x - 1;
  if (targetX < 0) return false;

  // Check if target column is empty for the item's entire height
  for (let ty = item.y; ty < item.y + item.h; ty++) {
    if (ty >= grid.length) return false;
    if (grid[ty][targetX] !== null && grid[ty][targetX] !== rightItemId) {
      return false;
    }
  }

  item.x -= 1;
  item.w += 1;
  return true;
}

function tryExpandTop(layout: any[], grid: (string | null)[][], x: number, y: number): boolean {
  if (y <= 0) return false;
  const topItemId = grid[y - 1][x];
  if (!topItemId) return false;
  const item = layout.find(i => i.i === topItemId);
  if (!item) return false;

  const targetY = item.y + item.h;
  if (targetY >= grid.length) return false; // Prevent expanding past maxY boundary

  for (let tx = item.x; tx < item.x + item.w; tx++) {
    if (grid[targetY][tx] !== null && grid[targetY][tx] !== topItemId) {
      return false;
    }
  }

  item.h += 1;
  return true;
}

function tryExpandBottom(layout: any[], grid: (string | null)[][], x: number, y: number): boolean {
  if (y >= grid.length - 1) return false;
  const bottomItemId = grid[y + 1][x];
  if (!bottomItemId) return false;
  const item = layout.find(i => i.i === bottomItemId);
  if (!item) return false;

  const targetY = item.y - 1;
  if (targetY < 0) return false;

  for (let tx = item.x; tx < item.x + item.w; tx++) {
    if (grid[targetY][tx] !== null && grid[targetY][tx] !== bottomItemId) {
      return false;
    }
  }

  item.y -= 1;
  item.h += 1;
  return true;
}

function getOriginalItem(id: string, breakpoint: string) {
  const layoutKey = breakpoint === "xs" ? "xs" : "lg";
  const defaultLayout = AboutLayout[layoutKey];
  return defaultLayout.find(item => item.i === id);
}

function solveLayoutPlacement(
  items: { id: string, wPref: number, hPref: number }[],
  grid: (string | null)[][],
  itemIndex: number,
  cols: number,
  rows: number,
  placements: Map<string, { x: number, y: number, w: number, h: number }>
): boolean {
  if (itemIndex === items.length) {
    return true;
  }

  const item = items[itemIndex];
  const candidates: { w: number, h: number }[] = [];
  
  // Preferred size is first choice
  candidates.push({ w: item.wPref, h: item.hPref });
  
  // Intermediate sizes
  if (item.wPref > 1 && item.hPref > 1) {
    candidates.push({ w: 1, h: item.hPref });
    candidates.push({ w: item.wPref, h: 1 });
  }
  
  // 1x1 as fallback
  if (item.wPref > 1 || item.hPref > 1) {
    candidates.push({ w: 1, h: 1 });
  }

  // Remove duplicates from candidates
  const uniqueCandidates: { w: number, h: number }[] = [];
  const seen = new Set<string>();
  for (const cand of candidates) {
    const key = `${cand.w}x${cand.h}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCandidates.push(cand);
    }
  }

  for (const cand of uniqueCandidates) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (x + cand.w <= cols && y + cand.h <= rows) {
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
            // Place item
            for (let dy = 0; dy < cand.h; dy++) {
              for (let dx = 0; dx < cand.w; dx++) {
                grid[y + dy][x + dx] = item.id;
              }
            }
            placements.set(item.id, { x, y, w: cand.w, h: cand.h });

            // Recurse
            if (solveLayoutPlacement(items, grid, itemIndex + 1, cols, rows, placements)) {
              return true;
            }

            // Backtrack
            for (let dy = 0; dy < cand.h; dy++) {
              for (let dx = 0; dx < cand.w; dx++) {
                grid[y + dy][x + dx] = null;
              }
            }
            placements.delete(item.id);
          }
        }
      }
    }
  }

  return false;
}

function packAndFillLayout(
  layout: any[],
  cols: number,
  rows: number,
  changedItem: any | null,
  breakpoint: string
): any[] {
  let clampedChangedItem: any = null;
  if (changedItem) {
    let w = changedItem.w;
    let h = changedItem.h;
    
    // Enforce that area (w * h) <= 6 (to leave room for other 6 items)
    if (w * h > 6) {
      if (w > 3) w = 3;
      if (h > 2) h = 2;
      if (w * h > 6) {
        w = 2;
        h = 2;
      }
    }
    
    w = Math.max(1, Math.min(w, cols));
    h = Math.max(1, Math.min(h, rows));
    const x = Math.max(0, Math.min(changedItem.x, cols - w));
    const y = Math.max(0, Math.min(changedItem.y, rows - h));
    
    clampedChangedItem = {
      ...changedItem,
      x,
      y,
      w,
      h
    };
  }

  const grid: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  const newLayoutMap = new Map<string, any>();
  
  if (clampedChangedItem) {
    newLayoutMap.set(clampedChangedItem.i, clampedChangedItem);
    for (let dy = 0; dy < clampedChangedItem.h; dy++) {
      for (let dx = 0; dx < clampedChangedItem.w; dx++) {
        grid[clampedChangedItem.y + dy][clampedChangedItem.x + dx] = clampedChangedItem.i;
      }
    }
  }

  const remainingItems = layout
    .filter(item => !clampedChangedItem || item.i !== clampedChangedItem.i)
    .map(item => {
      const prev = layout.find(p => p.i === item.i) || getOriginalItem(item.i, breakpoint) || item;
      return {
        ...item,
        prevX: prev.x,
        prevY: prev.y,
        prevW: prev.w,
        prevH: prev.h
      };
    });

  // Sort by preferred area descending to optimize packing success
  remainingItems.sort((a, b) => {
    const origA = getOriginalItem(a.i, breakpoint);
    const origB = getOriginalItem(b.i, breakpoint);
    const areaA = (origA ? origA.w * origA.h : a.w * a.h) || 1;
    const areaB = (origB ? origB.w * origB.h : b.w * b.h) || 1;
    return areaB - areaA;
  });

  const itemsToPlace = remainingItems.map(item => {
    const orig = getOriginalItem(item.i, breakpoint);
    return {
      id: item.i,
      wPref: orig ? orig.w : item.w,
      hPref: orig ? orig.h : item.h,
      rawItem: item
    };
  });

  const placements = new Map<string, { x: number, y: number, w: number, h: number }>();
  
  const success = solveLayoutPlacement(itemsToPlace, grid, 0, cols, rows, placements);

  if (success) {
    for (const item of itemsToPlace) {
      const plc = placements.get(item.id)!;
      newLayoutMap.set(item.id, {
        ...item.rawItem,
        x: plc.x,
        y: plc.y,
        w: plc.w,
        h: plc.h
      });
    }
  } else {
    // Fallback if solver fails: just place them as 1x1 in any empty cell
    for (const item of itemsToPlace) {
      let placed = false;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (grid[y][x] === null) {
            grid[y][x] = item.id;
            newLayoutMap.set(item.id, {
              ...item.rawItem,
              x,
              y,
              w: 1,
              h: 1
            });
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
    }
  }

  const newLayout = Array.from(newLayoutMap.values());
  
  // Fill gaps using expansion
  let changed = true;
  let iterations = 0;
  const maxIterations = cols * rows * 4;

  while (changed && iterations < maxIterations) {
    iterations++;
    changed = false;

    const currentGrid: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
    for (const item of newLayout) {
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

          if (tryExpandLeft(newLayout, currentGrid, x, y, cols) ||
              tryExpandRight(newLayout, currentGrid, x, y, cols) ||
              tryExpandTop(newLayout, currentGrid, x, y) ||
              tryExpandBottom(newLayout, currentGrid, x, y)) {
            changed = true;
            break;
          }
        }
      }
      if (changed) break;
    }
    if (!foundEmpty) break;
  }

  return newLayout;
}

function Layout() {
  const [layouts, setLayouts] = useState<Layouts>(() => ({
    lg: packAndFillLayout(AboutLayout.lg, 4, 3, null, "lg"),
    xs: packAndFillLayout(AboutLayout.xs, 1, 3, null, "xs")
  }));
  const [currentCols, setCurrentCols] = useState(4);
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");

  const ResponsiveReactGridLayout = useMemo(
    () => WidthProvider(Responsive),
    []
  );

  const onBreakpointChange = (newBreakpoint: string, newCols: number) => {
    setCurrentBreakpoint(newBreakpoint);
    setCurrentCols(newCols);
  };

  const handleDrag = (currentLayout: any[], _oldItem: any, newItem: any) => {
    const filledCurrentLayout = packAndFillLayout(currentLayout, currentCols, 3, newItem, currentBreakpoint);
    setLayouts(prev => ({
      ...prev,
      [currentBreakpoint]: filledCurrentLayout
    }));
  };

  const handleResize = (currentLayout: any[], _oldItem: any, newItem: any) => {
    const filledCurrentLayout = packAndFillLayout(currentLayout, currentCols, 3, newItem, currentBreakpoint);
    setLayouts(prev => ({
      ...prev,
      [currentBreakpoint]: filledCurrentLayout
    }));
  };

  const handleDragStop = (currentLayout: any[], _oldItem: any, newItem: any) => {
    const filledCurrentLayout = packAndFillLayout(currentLayout, currentCols, 3, newItem, currentBreakpoint);
    setLayouts(prev => ({
      ...prev,
      [currentBreakpoint]: filledCurrentLayout
    }));
  };

  const handleResizeStop = (currentLayout: any[], _oldItem: any, newItem: any) => {
    const filledCurrentLayout = packAndFillLayout(currentLayout, currentCols, 3, newItem, currentBreakpoint);
    setLayouts(prev => ({
      ...prev,
      [currentBreakpoint]: filledCurrentLayout
    }));
  };

  return (
    <div 
      className="mx-auto border-4 border-slate-800/15 rounded-[40px] bg-slate-800/5 shadow-2xl backdrop-blur-sm"
      style={{
        width: "694.72px",
        height: "533.54px",
        minWidth: "694.72px",
        minHeight: "533.54px",
        maxWidth: "694.72px",
        maxHeight: "533.54px",
        padding: "16px",
        boxSizing: "border-box"
      }}
    >
      <ResponsiveReactGridLayout
        className="m-auto" 
        style={{
          width: "654.72px",
          height: "493.54px"
        }}
        breakpoints={{ lg: 0 }}  
        cols={{ lg: 4 }}  
        rowHeight={151.18}
        layouts={layouts}
        compactType={null}
        maxRows={3}
        onDrag={handleDrag}
        onResize={handleResize}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        onBreakpointChange={onBreakpointChange}
        margin={[10, 10]}
        containerPadding={[10, 10]}
      >
        {keys.map((key) => (
          <div
            key={key}
            className="flex justify-center items-center shadow-[inset_0_0_0_2px_rgba(0,0,0,0)] rounded-3.5xl text-2xl text-[#FFFFFF] visible cursor-grab active:cursor-grabbing fade-in"
          >
            <Block keyProp={"Tile " + key} />
          </div>
        ))}
      </ResponsiveReactGridLayout>
    </div>
  );
}

const Block = ({ keyProp }: { keyProp: string }) => {
  const [label, keyPart] = keyProp.split(" ");

  return (
    <div
      style={{ backgroundColor: 'rgba(20, 20, 20, 0.65)' }}
      className="h-full w-full flex flex-col justify-center items-center p-6 text-[var(--black-1)] rounded-3xl"
    >
      <span>
        <span className="normal-case">{label}</span>{" "}
        <span className="uppercase">{keyPart}</span>
      </span>
    </div>
  );
};

export default Layout;
