import { useEffect, useState } from "react";
import { useReplay, getFrameAt } from "@/hooks/useReplay";
import { drivers, timelines } from "@/data/f1Mock";
import { Award, Zap } from "lucide-react";

function formatLapTime(ms: number | undefined): string {
  if (!ms || ms <= 0) return "-";
  const totalSec = ms / 1000;
  const mins = Math.floor(totalSec / 60);
  const secs = Math.floor(totalSec % 60);
  const millis = Math.floor(ms % 1000);
  return `${mins}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

function getGap(driverId1: string, driverId2: string, lap: number): string {
  if (lap < 2) return "-";
  const tl1 = timelines.find((t) => t.shortId === driverId1);
  const tl2 = timelines.find((t) => t.shortId === driverId2);
  if (!tl1 || !tl2) return "-";
  
  const idx = lap - 2; // Index for completed lap
  if (idx < 0 || idx >= tl1.cumSec.length || idx >= tl2.cumSec.length) return "-";
  
  const diff = Math.abs(tl1.cumSec[idx] - tl2.cumSec[idx]);
  return `+${diff.toFixed(3)}s`;
}

export default function DriverHeadToHead() {
  const focusedId = useReplay((s) => s.focusedDriverId);
  const [currentFrame, setCurrentFrame] = useState<any>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const t = useReplay.getState().time;
      const frame = getFrameAt(t);
      setCurrentFrame(frame);
    }, 150);
    return () => clearInterval(id);
  }, []);

  const activeCar = currentFrame?.cars.find((c: any) => c.driverId === focusedId);
  if (!activeCar) {
    return (
      <div className="flex h-full items-center justify-center text-[9px] text-muted-foreground uppercase tracking-wider">
        Loading Battle...
      </div>
    );
  }

  const activePos = activeCar.position;
  const totalCars = currentFrame?.cars.length || 20;

  let pos1 = activePos - 1;
  let pos2 = activePos;
  let pos3 = activePos + 1;

  if (activePos === 1) {
    pos1 = 1;
    pos2 = 2;
    pos3 = 3;
  } else if (activePos >= totalCars) {
    pos1 = totalCars - 2;
    pos2 = totalCars - 1;
    pos3 = totalCars;
  }

  const car1 = currentFrame?.cars.find((c: any) => c.position === pos1);
  const car2 = currentFrame?.cars.find((c: any) => c.position === pos2);
  const car3 = currentFrame?.cars.find((c: any) => c.position === pos3);

  const meta1 = car1 ? drivers.find((d) => d.id === car1.driverId) : null;
  const meta2 = car2 ? drivers.find((d) => d.id === car2.driverId) : null;
  const meta3 = car3 ? drivers.find((d) => d.id === car3.driverId) : null;

  if (!meta2) return null;

  return (
    <div className="flex flex-col h-full select-none text-white overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between mb-2.5 px-1 shrink-0">
        <div className="text-[12px] card-title-adaptive font-semibold tracking-[0.2em] uppercase text-white flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-primary" /> Battle
        </div>
      </div>

      {/* Driver Names Comparison */}
      <div className="grid grid-cols-3 gap-2 text-center border-b border-white/10 pb-2 mb-2 shrink-0">
        {/* Driver 1 */}
        <div className="flex flex-col items-center">
          {meta1 && car1 ? (
            <>
              <span 
                className="w-1.5 h-3 rounded-sm mb-1" 
                style={{ backgroundColor: meta1.color }}
              />
              <span className="text-[9px] card-text-adaptive-sm font-semibold uppercase text-white tracking-wider">
                {meta1.code}
              </span>
              <span className="text-[8px] card-text-adaptive-xs text-white/60 mono mt-0.5 font-bold">
                P{car1.position}
              </span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-3 rounded-sm mb-1 bg-transparent" />
              <span className="text-[9px] card-text-adaptive-sm font-semibold uppercase text-white/30 tracking-wider">
                -
              </span>
              <span className="text-[8px] card-text-adaptive-xs text-white/30 mono mt-0.5 font-bold">
                -
              </span>
            </>
          )}
        </div>

        {/* Driver 2 (Middle / Selected) */}
        <div className="flex flex-col items-center border-x border-white/10">
          <span 
            className="w-1.5 h-3 rounded-sm mb-1" 
            style={{ backgroundColor: meta2.color }}
          />
          <span className="text-[9px] card-text-adaptive-sm font-semibold uppercase text-white tracking-wider font-extrabold">
            {meta2.code}
          </span>
          <span className="text-[8px] card-text-adaptive-xs text-white/60 mono mt-0.5 font-bold">
            P{car2.position}
          </span>
        </div>

        {/* Driver 3 */}
        <div className="flex flex-col items-center">
          {meta3 && car3 ? (
            <>
              <span 
                className="w-1.5 h-3 rounded-sm mb-1" 
                style={{ backgroundColor: meta3.color }}
              />
              <span className="text-[9px] card-text-adaptive-sm font-semibold uppercase text-white tracking-wider">
                {meta3.code}
              </span>
              <span className="text-[8px] card-text-adaptive-xs text-white/60 mono mt-0.5 font-bold">
                P{car3.position}
              </span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-3 rounded-sm mb-1 bg-transparent" />
              <span className="text-[9px] card-text-adaptive-sm font-semibold uppercase text-white/30 tracking-wider">
                -
              </span>
              <span className="text-[8px] card-text-adaptive-xs text-white/30 mono mt-0.5 font-bold">
                -
              </span>
            </>
          )}
        </div>
      </div>

      {/* Telemetry Metrics */}
      <div className="space-y-3.5 flex-1 overflow-y-auto scrollbar-none pr-1">
        {/* Battle Gaps and Lap Times */}
        <div className="bg-white/5 rounded-sm p-2 flex flex-col gap-1.5 shrink-0 text-center">
          <div className="grid grid-cols-3 text-[8px] card-text-adaptive-xs uppercase tracking-widest text-white/60 font-semibold mb-0.5">
            <span>Gap Front</span>
            <span>Last Lap</span>
            <span>Gap Behind</span>
          </div>
          <div className="grid grid-cols-3 items-center font-mono text-xs card-text-adaptive-sm font-bold text-center gap-0.5">
            <span className="text-emerald-400">{car1 && car2 ? getGap(car2.driverId, car1.driverId, car2.lap) : "-"}</span>
            <div className="flex justify-center">
              <span className="text-white bg-white/10 py-0.5 px-[clamp(3px,1.2cqw,6px)] rounded-sm truncate">{formatLapTime(car2.lastLapMs)}</span>
            </div>
            <span className="text-rose-400">{car3 && car2 ? getGap(car3.driverId, car2.driverId, car2.lap) : "-"}</span>
          </div>
          {car1 || car3 ? (
            <div className="grid grid-cols-3 text-[9px] card-text-adaptive-xs text-white/60 font-semibold mt-1 text-center">
              <span>{car1 ? `(${formatLapTime(car1.lastLapMs)})` : ""}</span>
              <span className="text-[7px] card-text-adaptive-xs text-white/40 uppercase font-bold">L{car2.lap - 1} Time</span>
              <span>{car3 ? `(${formatLapTime(car3.lastLapMs)})` : ""}</span>
            </div>
          ) : null}
        </div>

        {/* Speed */}
        <div>
          <div className="text-[8px] card-text-adaptive-xs text-white/60 uppercase tracking-widest font-semibold text-center mb-1 leading-none">
            Speed
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] card-text-adaptive-sm font-bold font-mono">
            <span className="text-white/60">{car1 ? `${car1.speed} km/h` : "-"}</span>
            <span className="text-white">{car2.speed} km/h</span>
            <span className="text-white/60">{car3 ? `${car3.speed} km/h` : "-"}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="h-1 bg-white/10 rounded-sm overflow-hidden">
              {car1 && meta1 && (
                <div 
                  className="h-full transition-all duration-150" 
                  style={{ width: `${(car1.speed / 350) * 100}%`, backgroundColor: meta1.color }}
                />
              )}
            </div>
            <div className="h-1 bg-white/10 rounded-sm overflow-hidden">
              <div 
                className="h-full transition-all duration-150" 
                style={{ width: `${(car2.speed / 350) * 100}%`, backgroundColor: meta2.color }}
              />
            </div>
            <div className="h-1 bg-white/10 rounded-sm overflow-hidden">
              {car3 && meta3 && (
                <div 
                  className="h-full transition-all duration-150" 
                  style={{ width: `${(car3.speed / 350) * 100}%`, backgroundColor: meta3.color }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Throttle */}
        <div>
          <div className="text-[8px] card-text-adaptive-xs text-white/60 uppercase tracking-widest font-semibold text-center mb-1 leading-none">
            Throttle
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] card-text-adaptive-sm font-bold font-mono">
            <span className="text-white/60">{car1 ? `${Math.round(car1.throttle * 100)}%` : "-"}</span>
            <span className="text-white">{Math.round(car2.throttle * 100)}%</span>
            <span className="text-white/60">{car3 ? `${Math.round(car3.throttle * 100)}%` : "-"}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="h-1 bg-white/10 rounded-sm overflow-hidden">
              {car1 && meta1 && (
                <div 
                  className="h-full transition-all duration-150" 
                  style={{ width: `${car1.throttle * 100}%`, backgroundColor: meta1.color }}
                />
              )}
            </div>
            <div className="h-1 bg-white/10 rounded-sm overflow-hidden">
              <div 
                className="h-full transition-all duration-150" 
                style={{ width: `${car2.throttle * 100}%`, backgroundColor: meta2.color }}
              />
            </div>
            <div className="h-1 bg-white/10 rounded-sm overflow-hidden">
              {car3 && meta3 && (
                <div 
                  className="h-full transition-all duration-150" 
                  style={{ width: `${car3.throttle * 100}%`, backgroundColor: meta3.color }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Brake */}
        <div>
          <div className="text-[8px] card-text-adaptive-xs text-white/60 uppercase tracking-widest font-semibold text-center mb-1 leading-none">
            Brake
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] card-text-adaptive-sm font-bold font-mono">
            <span className="text-white/60">{car1 ? `${Math.round(car1.brake * 100)}%` : "-"}</span>
            <span className="text-white">{Math.round(car2.brake * 100)}%</span>
            <span className="text-white/60">{car3 ? `${Math.round(car3.brake * 100)}%` : "-"}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="h-1 bg-white/10 rounded-sm overflow-hidden">
              {car1 && meta1 && (
                <div 
                  className="h-full transition-all duration-150" 
                  style={{ width: `${car1.brake * 100}%`, backgroundColor: meta1.color }}
                />
              )}
            </div>
            <div className="h-1 bg-white/10 rounded-sm overflow-hidden">
              <div 
                className="h-full transition-all duration-150" 
                style={{ width: `${car2.brake * 100}%`, backgroundColor: meta2.color }}
              />
            </div>
            <div className="h-1 bg-white/10 rounded-sm overflow-hidden">
              {car3 && meta3 && (
                <div 
                  className="h-full transition-all duration-150" 
                  style={{ width: `${car3.brake * 100}%`, backgroundColor: meta3.color }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Gear */}
        <div className="pt-2.5 border-t border-white/10">
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] card-text-adaptive-base font-semibold font-mono">
            <span className="text-white/60">{car1 ? `G${car1.gear}` : "-"}</span>
            <span className="text-white">G{car2.gear}</span>
            <span className="text-white/60">{car3 ? `G${car3.gear}` : "-"}</span>
          </div>
          <div className="text-[8px] card-text-adaptive-xs text-white/60 uppercase tracking-widest font-semibold text-center mt-1 leading-none">
            Gear Selection
          </div>
        </div>
      </div>
    </div>
  );
}
