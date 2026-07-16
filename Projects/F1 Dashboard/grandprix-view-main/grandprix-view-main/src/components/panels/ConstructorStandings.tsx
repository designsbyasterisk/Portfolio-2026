interface ConstructorStanding {
  pos: number;
  name: string;
  points: number;
  color: string;
}

const CONSTRUCTORS_BEFORE_MONACO: ConstructorStanding[] = [
  { pos: 1, name: "Red Bull", points: 268, color: "#1E40AF" },
  { pos: 2, name: "Ferrari", points: 212, color: "#DC2626" },
  { pos: 3, name: "McLaren", points: 154, color: "#F97316" },
  { pos: 4, name: "Mercedes", points: 79, color: "#06B6D4" },
  { pos: 5, name: "Aston Martin", points: 44, color: "#10B981" },
  { pos: 6, name: "RB", points: 20, color: "#3B82F6" },
  { pos: 7, name: "Haas", points: 7, color: "#B6BABD" },
  { pos: 8, name: "Alpine", points: 1, color: "#EC4899" },
  { pos: 9, name: "Williams", points: 0, color: "#0EA5E9" },
  { pos: 10, name: "Kick Sauber", points: 0, color: "#52E252" }
];

import { Wrench } from "lucide-react";

export default function ConstructorStandings() {
  const max = Math.max(...CONSTRUCTORS_BEFORE_MONACO.map(c => c.points));
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2.5 px-1 shrink-0">
        <div className="text-[12px] card-title-adaptive font-semibold tracking-[0.2em] uppercase text-white flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-primary" /> Constructors
        </div>
        <div className="text-[9px] card-text-adaptive-xs mono text-muted-foreground tracking-widest font-bold">PTS</div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2.5 px-2 scrollbar-none">
        {CONSTRUCTORS_BEFORE_MONACO.map((c) => (
          <div key={c.name} className="flex items-center gap-2">
            <span className="w-4 text-[10px] card-text-adaptive-sm font-bold mono text-muted-foreground">{c.pos}</span>
            <span className="w-1 h-5" style={{ backgroundColor: c.color }} />
            <span className="flex-1 text-[11px] card-text-adaptive-sm font-medium uppercase tracking-wider text-foreground truncate">{c.name}</span>
            <div className="w-20 h-1.5 bg-secondary relative card-hide-narrow">
              <div className="absolute left-0 top-0 h-full" style={{ width: `${max > 0 ? (c.points / max) * 100 : 0}%`, backgroundColor: c.color }} />
            </div>
            <span className="w-10 text-right text-[11px] card-text-adaptive-sm font-bold mono text-foreground">{c.points}</span>
          </div>
        ))}
      </div>
    </div>

  );
}
