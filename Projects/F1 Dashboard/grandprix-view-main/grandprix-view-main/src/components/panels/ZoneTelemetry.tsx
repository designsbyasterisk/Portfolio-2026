import { Info, Gauge, Shield } from "lucide-react";
import { useReplay } from "@/hooks/useReplay";

interface ZoneStats {
  title: string;
  description: string;
  speed: number;
  gear: number;
  throttle: number;
  brake: number;
  gForce?: string;
  difficulty: "Low" | "Medium" | "High" | "Extreme";
}

const ZONE_STATS_MAP: Record<string, ZoneStats> = {
  s1: {
    title: "Sector 1",
    description: "High-speed uphill sweep leading from the Start/Finish line to Casino Square. Requires precise steering and maximum power delivery.",
    speed: 285,
    gear: 7,
    throttle: 1.0,
    brake: 0.0,
    gForce: "2.8 G",
    difficulty: "Medium"
  },
  s2: {
    title: "Sector 2",
    description: "Extremely tight, technical sequence containing the Grand Hotel Hairpin, Portier, and the Tunnel entrance. The slowest and most punishing sector.",
    speed: 110,
    gear: 3,
    throttle: 0.45,
    brake: 0.35,
    gForce: "1.8 G",
    difficulty: "Extreme"
  },
  s3: {
    title: "Sector 3",
    description: "Fast flowing sections around the Swimming Pool chicane, Rascasse, and Anthony Noghes. Driver confidence and curb compliance are key.",
    speed: 210,
    gear: 5,
    throttle: 0.8,
    brake: 0.15,
    gForce: "3.5 G",
    difficulty: "High"
  },
  pit_entry: {
    title: "Pit Entry Zone",
    description: "Strict speed limit of 60 km/h enforced right after the tight corner of Rascasse. Requires sudden deceleration and precise positioning.",
    speed: 60,
    gear: 2,
    throttle: 0.15,
    brake: 0.8,
    difficulty: "Medium"
  },
  pit_exit: {
    title: "Pit Exit Zone",
    description: "Acceleration zone blending back onto the live track. Drivers must stay within the blend line to avoid safety penalties before Sainte Devote.",
    speed: 80,
    gear: 2,
    throttle: 0.95,
    brake: 0.0,
    difficulty: "Low"
  },
  tunnel: {
    title: "Grand Hotel Tunnel",
    description: "The highest speed point on the circuit. A blind, curved tunnel in pitch darkness. Demands maximum throttle under aerodynamic compression.",
    speed: 295,
    gear: 8,
    throttle: 1.0,
    brake: 0.0,
    gForce: "3.2 G",
    difficulty: "High"
  },
  drs_1: {
    title: "DRS Activation Zone",
    description: "The only Drag Reduction System zone. Rear wing flap opens to increase top speed on the main pit straight by reducing aerodynamic drag.",
    speed: 305,
    gear: 8,
    throttle: 1.0,
    brake: 0.0,
    gForce: "1.2 G",
    difficulty: "Low"
  },
  t1: {
    title: "Turn 1 (Sainte Devote)",
    description: "Crucial right-hand corner. Heavy braking zone immediately after the main straight. Site of many start-line incidents and lockups.",
    speed: 90,
    gear: 2,
    throttle: 0.1,
    brake: 0.9,
    gForce: "2.5 G",
    difficulty: "High"
  },
  t6: {
    title: "Turn 6 (Fairmont Hairpin)",
    description: "The slowest corner on the entire F1 calendar. Drivers require extreme steering lock and 1st gear to navigate the tight 180-degree hairpin.",
    speed: 45,
    gear: 1,
    throttle: 0.25,
    brake: 0.5,
    gForce: "1.1 G",
    difficulty: "Extreme"
  },
  t13: {
    title: "Turn 13-14 (Swimming Pool)",
    description: "High-speed double-apex chicane. Taken over high curbs, pushing the car's suspension and testing lateral stability at high velocity.",
    speed: 195,
    gear: 5,
    throttle: 0.75,
    brake: 0.2,
    gForce: "4.1 G",
    difficulty: "Extreme"
  }
};

function SpeedGauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(1, value));
  const r = 40;
  const cx = 50, cy = 50;
  const start = Math.PI * 0.85;
  const end = Math.PI * 0.15;
  const arc = (t: number) => {
    const a = start + (end + Math.PI * 2 - start) * t;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const path = (from: number, to: number) => {
    const [x1, y1] = arc(from);
    const [x2, y2] = arc(to);
    const sweep = (end + Math.PI * 2 - start) * (to - from);
    const large = sweep > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  return (
    <svg viewBox="0 0 100 75" className="w-full h-full">
      <path d={path(0, 1)} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d={path(0, v)} stroke="hsl(var(--primary))" strokeWidth="6" fill="none" strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 4px hsl(var(--f1-red-glow)))" }} />
    </svg>
  );
}

function BarLabel({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[8px] uppercase tracking-widest text-muted-foreground font-bold">
        <span>{label}</span>
        <span className="mono text-white">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-sm overflow-hidden">
        <div className="h-full transition-all duration-150 rounded-sm" style={{ width: `${value * 100}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
    </div>
  );
}

export default function ZoneTelemetry({ zoneId }: { zoneId: string }) {
  const setSelectedZone = useReplay((s) => s.setSelectedZone);
  const stats = ZONE_STATS_MAP[zoneId];
  if (!stats) return null;

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Extreme": return "text-red-500 border-red-500 bg-red-500/10";
      case "High": return "text-orange-500 border-orange-500 bg-orange-500/10";
      case "Medium": return "text-yellow-500 border-yellow-500 bg-yellow-500/10";
      default: return "text-emerald-500 border-emerald-500 bg-emerald-500/10";
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-full w-full select-none text-white overflow-y-auto py-1 custom-scrollbar zone-telemetry-grid">
      {/* Col 1: Zone Info & Description */}
      <div className="flex flex-col justify-between border-r border-white/5 pr-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
                Zone Info
              </span>
            </div>
            <button 
              onClick={() => setSelectedZone(null)}
              className="text-[9px] font-semibold tracking-wider text-muted-foreground hover:text-white transition-colors"
            >
              Clear ×
            </button>
          </div>
          <h3 className="text-sm font-semibold uppercase text-white truncate">
            {stats.title}
          </h3>
          <p className="text-[9px] text-muted-foreground mt-1.5 leading-relaxed font-medium zone-desc-hide-short">
            {stats.description}
          </p>
        </div>

        <div className="flex gap-2.5 pt-2">
          <div className="flex-1 bg-white/5 border border-white/5 p-1 px-2 rounded flex flex-col justify-center zone-telemetry-difficulty-container">
            <span className="text-[7px] text-muted-foreground uppercase tracking-wider block font-bold leading-none">Difficulty</span>
            <span className={`text-[8px] font-semibold uppercase tracking-wider mt-1 border px-1 rounded text-center leading-normal ${getDifficultyColor(stats.difficulty)}`}>
              {stats.difficulty}
            </span>
          </div>
          {stats.gForce && (
            <div className="flex-1 bg-white/5 border border-white/5 p-1 px-2 rounded flex flex-col justify-center text-center zone-telemetry-difficulty-container">
              <span className="text-[7px] text-muted-foreground uppercase tracking-wider block font-bold leading-none">Typical Gs</span>
              <span className="text-[10px] font-semibold tracking-tight mt-1 block mono text-white leading-normal">{stats.gForce}</span>
            </div>
          )}
        </div>
      </div>

      {/* Col 2: Speed Gauge & Typical Gear */}
      <div className="flex flex-col justify-between border-r border-white/5 pr-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Gauge className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 font-bold">
              Zone Telemetry
            </span>
          </div>
        </div>

        <div className="flex-1 flex gap-4 items-center justify-between">
          {/* Speed Dial */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-16 zone-telemetry-gauge w-full relative flex items-end justify-center">
              <SpeedGauge value={stats.speed / 360} />
              <div className="absolute inset-x-0 bottom-0 text-center">
                <div className="text-base font-semibold mono leading-none text-white">{stats.speed}</div>
                <div className="text-[7px] text-muted-foreground uppercase tracking-widest mt-0.5 font-bold">KM/H</div>
              </div>
            </div>
          </div>

          {/* Typical Gear */}
          <div className="bg-white/5 border border-white/5 p-2 px-3 text-center rounded-md shrink-0 min-w-[50px] flex flex-col justify-center">
            <span className="text-[7px] text-muted-foreground uppercase tracking-wider block font-bold leading-none">Gear</span>
            <span className="text-xl font-bold mono text-primary leading-tight mt-1 block">{stats.gear}</span>
          </div>
        </div>
      </div>

      {/* Col 3: Throttle & Brake Traces */}
      <div className="flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
              Input Profile
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-3.5 pb-1">
          <BarLabel label="Typical Throttle" value={stats.throttle} color="#00E676" />
          <BarLabel label="Typical Brake" value={stats.brake} color="#e8002d" />
        </div>
      </div>
    </div>
  );
}
