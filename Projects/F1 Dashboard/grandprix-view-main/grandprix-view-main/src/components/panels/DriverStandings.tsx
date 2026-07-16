import { useEffect, useState } from "react";
import { drivers } from "@/data/f1Mock";
import { useReplay, getFrameAt } from "@/hooks/useReplay";
import { ChevronUp, ChevronDown, Minus, Flag } from "lucide-react";

export default function DriverStandings() {
  const [, force] = useState(0);
  useEffect(() => { const id = setInterval(() => force(n => n + 1), 250); return () => clearInterval(id); }, []);
  const time = useReplay((s) => s.time);
  const focused = useReplay((s) => s.focusedDriverId);
  const setFocus = useReplay((s) => s.setFocus);
  const frame = getFrameAt(time);
  const ordered = [...drivers].sort((a, b) => {
    const pa = frame.cars.find(c => c.driverId === a.id)?.position ?? 99;
    const pb = frame.cars.find(c => c.driverId === b.id)?.position ?? 99;
    return pa - pb;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2.5 px-1 shrink-0">
        <div className="text-[12px] card-title-adaptive font-semibold tracking-[0.2em] uppercase text-white flex items-center gap-1.5">
          <Flag className="w-3.5 h-3.5 text-white" /> Live Order
        </div>
        <div className="text-[9px] card-text-adaptive-xs mono text-white/70 tracking-widest font-bold">P · DRIVER · GAP</div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 -mr-1 pr-1 scrollbar-none">
        {ordered.map((d, i) => {
          const car = frame.cars.find(c => c.driverId === d.id);
          const isFocused = focused === d.id;
          const delta = d.delta;
          return (
            <button
              key={d.id}
              onClick={() => setFocus(d.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors border-l-2 ${
                isFocused ? "bg-black/40 border-white" : "bg-black/20 border-transparent hover:bg-black/30"
              }`}
              style={{ borderLeftColor: isFocused ? d.color : undefined }}
            >
              <span className="w-5 text-xs card-text-adaptive-sm font-bold mono text-white/70">{i + 1}</span>
              <span className="w-1 h-6" style={{ backgroundColor: d.color }} />
              <span className="w-12 text-[11px] card-text-adaptive-sm font-bold mono flex items-center gap-1">
                <span>{d.code}</span>
                <span className="text-[9px] text-white/45 font-semibold">#{d.number}</span>
              </span>
              <span className="flex-1 text-[10px] card-text-adaptive-xs text-white/70 truncate card-hide-narrow">{d.team}</span>
              <span className={`text-[10px] card-text-adaptive-sm mono ${d.status !== "Finished" && d.status !== "Lapped" ? "text-white font-semibold" : "text-white/90"}`}>
                {(() => {
                  if (d.status !== "Finished" && d.status !== "Lapped") {
                    return (d.status.includes("Collision") || d.status.includes("damage") ? "DNF" : d.status);
                  }
                  
                  const leaderCar = frame.cars.find(c => c.position === 1);
                  const lapsDown = (leaderCar && car) ? Math.max(0, leaderCar.lap - car.lap) : 0;
                  
                  if (lapsDown > 0) {
                    return `+${lapsDown} Lap${lapsDown > 1 ? 's' : ''}`;
                  }
                  
                  return car?.lastLapMs ? formatLap(car.lastLapMs) : "—";
                })()}
              </span>
              <span className="flex items-center gap-0.5 w-10 justify-end text-[10px] card-text-adaptive-sm mono">
                {delta > 0 ? <ChevronUp className="w-3 h-3 text-white" /> : delta < 0 ? <ChevronDown className="w-3 h-3 text-black" /> : <Minus className="w-3 h-3 text-white/50" />}
                {Math.abs(delta)}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}

function formatLap(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = ((ms % 60000) / 1000).toFixed(3);
  return `${m}:${s.padStart(6, "0")}`;
}
