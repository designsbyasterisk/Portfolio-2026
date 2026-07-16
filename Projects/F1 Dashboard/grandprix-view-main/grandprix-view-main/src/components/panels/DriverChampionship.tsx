import { useState } from "react";
import { Trophy } from "lucide-react";

interface DriverStanding {
  pos: number;
  name: string;
  code: string;
  team: string;
  points: number;
  color: string;
}

const STANDINGS_BEFORE_MONACO: DriverStanding[] = [
  { pos: 1, name: "Max Verstappen", code: "VER", team: "Red Bull", points: 161, color: "#1E40AF" },
  { pos: 2, name: "Charles Leclerc", code: "LEC", team: "Ferrari", points: 113, color: "#DC2626" },
  { pos: 3, name: "Sergio Perez", code: "PER", team: "Red Bull", points: 107, color: "#1E40AF" },
  { pos: 4, name: "Lando Norris", code: "NOR", team: "McLaren", points: 101, color: "#F97316" },
  { pos: 5, name: "Carlos Sainz", code: "SAI", team: "Ferrari", points: 93, color: "#DC2626" },
  { pos: 6, name: "Oscar Piastri", code: "PIA", team: "McLaren", points: 53, color: "#F97316" },
  { pos: 7, name: "George Russell", code: "RUS", team: "Mercedes", points: 44, color: "#06B6D4" },
  { pos: 8, name: "Lewis Hamilton", code: "HAM", team: "Mercedes", points: 35, color: "#06B6D4" },
  { pos: 9, name: "Fernando Alonso", code: "ALO", team: "Aston Martin", points: 33, color: "#10B981" },
  { pos: 10, name: "Yuki Tsunoda", code: "TSU", team: "RB", points: 15, color: "#3B82F6" },
  { pos: 11, name: "Lance Stroll", code: "STR", team: "Aston Martin", points: 11, color: "#10B981" },
  { pos: 12, name: "Oliver Bearman", code: "BEA", team: "Ferrari", points: 6, color: "#DC2626" },
  { pos: 13, name: "Nico Hulkenberg", code: "HUL", team: "Haas", points: 6, color: "#B6BABD" },
  { pos: 14, name: "Daniel Ricciardo", code: "RIC", team: "RB", points: 5, color: "#3B82F6" },
  { pos: 15, name: "Esteban Ocon", code: "OCO", team: "Alpine", points: 1, color: "#EC4899" },
  { pos: 16, name: "Alexander Albon", code: "ALB", team: "Williams", points: 0, color: "#0EA5E9" },
  { pos: 17, name: "Pierre Gasly", code: "GAS", team: "Alpine", points: 0, color: "#EC4899" },
  { pos: 18, name: "Valtteri Bottas", code: "BOT", team: "Kick Sauber", points: 0, color: "#52E252" },
  { pos: 19, name: "Kevin Magnussen", code: "MAG", team: "Haas", points: 0, color: "#B6BABD" },
  { pos: 20, name: "Zhou Guanyu", code: "ZHO", team: "Kick Sauber", points: 0, color: "#52E252" },
  { pos: 21, name: "Logan Sargeant", code: "SAR", team: "Williams", points: 0, color: "#0EA5E9" }
];

const CAR_NUMBERS: Record<string, number> = {
  VER: 1,
  LEC: 16,
  PER: 11,
  NOR: 4,
  SAI: 55,
  PIA: 81,
  RUS: 63,
  HAM: 44,
  ALO: 14,
  TSU: 22,
  STR: 18,
  BEA: 38,
  HUL: 27,
  RIC: 3,
  OCO: 31,
  ALB: 23,
  GAS: 10,
  BOT: 77,
  MAG: 20,
  ZHO: 24,
  SAR: 2
};

export default function DriverChampionship() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2.5 px-1 shrink-0">
        <div className="text-[12px] card-title-adaptive font-semibold tracking-[0.2em] uppercase text-black flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-primary" /> Drivers Championship
        </div>
        <div className="text-[9px] card-text-adaptive-xs mono text-black/60 tracking-widest font-bold">PTS</div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 -mr-1 pr-1 scrollbar-none">
        {STANDINGS_BEFORE_MONACO.map((d) => (
          <div
            key={d.code}
            className="w-full flex items-center gap-2 px-2 py-1.5 bg-black/5 border-l-2 border-transparent rounded-sm"
          >
            <span className="w-5 text-xs card-text-adaptive-sm font-bold mono text-black/60">{d.pos}</span>
            <span className="w-1 h-5" style={{ backgroundColor: d.color }} />
            <span className="w-12 text-[11px] card-text-adaptive-sm font-bold mono text-black flex items-center gap-1">
              <span>{d.code}</span>
              <span className="text-[9px] text-black/40 font-semibold">#{CAR_NUMBERS[d.code] || ""}</span>
            </span>
            <span className="flex-1 text-[10px] card-text-adaptive-sm text-black/60 truncate card-hide-super-narrow">{d.name}</span>
            <span className="text-[10px] card-text-adaptive-xs text-black/50 truncate max-w-[80px] card-hide-narrow">{d.team}</span>
            <span className="w-10 text-right text-[11.5px] card-text-adaptive-sm font-semibold mono text-black">{d.points}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
