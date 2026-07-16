import { Trophy } from "lucide-react";

function getFullDriverName(name: string) {
  if (!name) return "";
  const nameLower = name.toLowerCase();
  if (nameLower === "leclerc") return "Charles Leclerc";
  if (nameLower === "hamilton") return "Lewis Hamilton";
  return name;
}

export default function RaceSummary({ raceResults, grid }: any) {
  return (
    <div className="relative z-10 flex flex-col h-full text-white min-h-0">

      <div className="uppercase tracking-[0.2em] font-semibold text-[12px] card-title-adaptive mb-2.5 text-white border-b border-white/20 pb-2 flex items-center gap-1.5 shrink-0">
        <Trophy className="w-3.5 h-3.5 text-white" /> Race Summary
      </div>
      {raceResults && (
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-none flex flex-col gap-3.5 min-h-0">
          <div className="space-y-1.5 text-[11px] card-text-adaptive-sm shrink-0">
            <div className="flex justify-between bg-black/20 px-3 py-1 rounded-sm items-center">
              <span className="text-white/70 uppercase tracking-wider font-bold text-[9px] card-text-adaptive-xs shrink-0 mr-2">Winner</span>
              <span className="font-bold uppercase text-right card-text-adaptive-sm truncate pl-2 max-w-[65%]">Charles Leclerc (Ferrari)</span>
            </div>
            <div className="flex justify-between bg-black/20 px-3 py-1 rounded-sm items-center">
              <span className="text-white/70 uppercase tracking-wider font-bold text-[9px] card-text-adaptive-xs shrink-0 mr-2">Pole Position</span>
              <span className="font-bold uppercase text-right card-text-adaptive-sm truncate pl-2 max-w-[65%]">{getFullDriverName(raceResults.pole)}</span>
            </div>
            <div className="flex justify-between bg-black/20 px-3 py-1 rounded-sm items-center">
              <span className="text-white/70 uppercase tracking-wider font-bold text-[9px] card-text-adaptive-xs shrink-0 mr-2">Fastest Lap</span>
              <span className="font-bold uppercase text-right card-text-adaptive-sm truncate pl-2 max-w-[65%]">{getFullDriverName(raceResults.fastestLap.driver)} ({raceResults.fastestLap.time})</span>
            </div>
            <div className="flex justify-between bg-black/20 px-3 py-1 rounded-sm items-center">
              <span className="text-white/70 uppercase tracking-wider font-bold text-[9px] card-text-adaptive-xs shrink-0 mr-2">Weather</span>
              <span className="font-bold text-right card-text-adaptive-sm truncate pl-2 max-w-[65%]">{raceResults.weather} ({raceResults.temp}°C)</span>
            </div>
            <div className="flex justify-between bg-black/20 px-3 py-1 rounded-sm items-center">
              <span className="text-white/70 uppercase tracking-wider font-bold text-[9px] card-text-adaptive-xs shrink-0 mr-2">Total Time</span>
              <span className="font-bold mono text-right card-text-adaptive-sm truncate pl-2 max-w-[65%]">{raceResults.raceTime}</span>
            </div>
          </div>
          
          {grid?.length >= 3 && (() => {
            const p1 = grid.find((r: any) => Number(r.pos) === 1) || grid[0];
            const p2 = grid.find((r: any) => Number(r.pos) === 2) || grid[1];
            const p3 = grid.find((r: any) => Number(r.pos) === 3) || grid[2];
            return (
              <>
                <div className="mt-auto flex flex-col shrink-0 card-hide-narrow pt-2.5">
                  <div className="text-[10px] font-semibold text-white/70 uppercase tracking-[0.15em] mb-1.5 card-text-adaptive-sm">Monaco GP Podium</div>
                  <div className="grid grid-cols-3 gap-2 items-end text-center">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-[9px] uppercase tracking-wide truncate w-full text-white/90 leading-tight">{getFullDriverName(p2.driver)}</span>
                      <span className="text-[7px] text-white/50 uppercase tracking-wider font-bold truncate w-full mb-0.5">{p2.team}</span>
                      <div className="w-full bg-black/25 rounded-t-md flex flex-col items-center justify-center pt-1 pb-1.5 border-t border-x border-white/10 h-[50px] shadow-sm">
                        <span className="text-white/40 text-[9px] uppercase tracking-wider font-semibold mb-0.5">P2</span>
                        <span className="text-white font-semibold text-base leading-none">2</span>
                      </div>
                    </div>

                    {/* 1st Place */}
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-[10px] uppercase tracking-wide truncate w-full text-white leading-tight drop-shadow-md">{getFullDriverName(p1.driver)}</span>
                      <span className="text-[7.5px] text-white/60 uppercase tracking-wider font-semibold truncate w-full mb-0.5">{p1.team}</span>
                      <div className="w-full bg-black/45 rounded-t-md flex flex-col items-center justify-center pt-1 pb-2 border-t border-x border-white/20 h-[72px] shadow-md relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500" />
                        <Trophy className="w-3.5 h-3.5 text-amber-400 mb-0.5 animate-pulse" />
                        <span className="text-white font-semibold text-xl leading-none">1</span>
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-[9px] uppercase tracking-wide truncate w-full text-white/90 leading-tight">{getFullDriverName(p3.driver)}</span>
                      <span className="text-[7px] text-white/50 uppercase tracking-wider font-bold truncate w-full mb-0.5">{p3.team}</span>
                      <div className="w-full bg-black/15 rounded-t-md flex flex-col items-center justify-center pt-1 pb-1.5 border-t border-x border-white/5 h-[40px] shadow-xs">
                        <span className="text-white/30 text-[8px] uppercase tracking-wider font-semibold mb-0.5">P3</span>
                        <span className="text-white/80 font-semibold text-sm leading-none">3</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-1.5 shrink-0 card-show-narrow pt-2">
                  <div className="text-[9px] font-semibold text-white/70 uppercase tracking-[0.15em] mb-1 card-text-adaptive-sm">Monaco GP Podium</div>
                  <div className="flex flex-col gap-1 text-[10px]">
                    <div className="flex justify-between bg-black/20 px-2 py-1 rounded-sm items-center">
                      <span className="text-amber-400 font-bold text-[9px] uppercase tracking-wider">P1</span>
                      <span className="font-semibold text-[10px] truncate max-w-[80%] text-right">{getFullDriverName(p1.driver)}</span>
                    </div>
                    <div className="flex justify-between bg-black/20 px-2 py-1 rounded-sm items-center">
                      <span className="text-white/70 font-bold text-[9px] uppercase tracking-wider">P2</span>
                      <span className="font-semibold text-[10px] truncate max-w-[80%] text-right">{getFullDriverName(p2.driver)}</span>
                    </div>
                    <div className="flex justify-between bg-black/20 px-2 py-1 rounded-sm items-center">
                      <span className="text-white/40 font-bold text-[9px] uppercase tracking-wider">P3</span>
                      <span className="font-semibold text-[10px] truncate max-w-[80%] text-right">{getFullDriverName(p3.driver)}</span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
