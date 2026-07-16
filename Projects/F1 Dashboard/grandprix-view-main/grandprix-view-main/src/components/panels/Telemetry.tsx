import { useEffect, useState } from "react";
import { useReplay, getCarFrame } from "@/hooks/useReplay";
import { drivers } from "@/data/f1Mock";
import { Gauge } from "lucide-react";

const TIRE_COLORS: Record<string, string> = {
  S: "hsl(var(--f1-red))",
  M: "hsl(var(--f1-yellow))",
  H: "hsl(0 0% 90%)",
  I: "hsl(var(--f1-green))",
  W: "hsl(210 90% 55%)",
};

export default function Telemetry() {
  const [, force] = useState(0);
  useEffect(() => { const id = setInterval(() => force(n => n + 1), 100); return () => clearInterval(id); }, []);
  const time = useReplay((s) => s.time);
  const focused = useReplay((s) => s.focusedDriverId);
  const driver = drivers.find(d => d.id === focused)!;
  const car = getCarFrame(time, focused);
  if (!car) return null;
  const speedPct = car.speed / 360;

  return (
    <div className="flex flex-row flex-nowrap gap-4 items-center justify-between w-full no-drag telemetry-container">
      {/* Left Column: Speed Gauge and Driver Info */}
      <div className="flex-1 min-w-[120px] flex flex-col items-center justify-center pr-2 telemetry-left-col">
        <div className="flex items-center justify-between w-full mb-1 telemetry-header">
          <div>
            <div className="text-[12px] card-title-adaptive font-semibold tracking-[0.2em] uppercase text-white flex items-center gap-1.5 mb-1">
              <Gauge className="w-3.5 h-3.5 text-primary" /> Telemetry
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1 h-4" style={{ backgroundColor: driver.color }} />
              <span className="text-[11px] font-bold tracking-wider telemetry-driver-text">#{driver.number} {driver.code}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] panel-title mr-1 telemetry-title">Pos</span>
            <span className="text-lg font-semibold mono text-primary leading-none telemetry-pos-val">{car.position}</span>
          </div>
        </div>

        {/* Speed gauge */}
        <div className="relative h-24 telemetry-gauge w-full flex items-end justify-center">
          <SpeedGauge value={speedPct} />
          <div className="absolute inset-x-0 bottom-1 text-center">
            <div className="text-2xl font-semibold mono leading-none telemetry-speed-val">{car.speed}</div>
            <div className="text-[8px] panel-title mt-0.5 telemetry-title">KM/H</div>
          </div>
        </div>
      </div>

      {/* Right Column: Gear, Tire, Throttle, Brake */}
      <div className="flex-[1.2] min-w-[140px] space-y-3 telemetry-right-col">
        {/* Gear + tire */}
        <div className="grid grid-cols-2 gap-2 telemetry-gear-tire-grid">
          <div className="bg-secondary/40 p-1.5 text-center rounded-sm telemetry-status-box">
            <div className="text-[8px] panel-title leading-tight telemetry-title">Gear</div>
            <div className="text-lg font-semibold mono text-primary leading-tight mt-0.5 telemetry-gear-val">{car.gear}</div>
          </div>
          <div className="bg-secondary/40 p-1.5 text-center rounded-sm telemetry-status-box">
            <div className="text-[8px] panel-title leading-tight telemetry-title">Tire</div>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-semibold leading-none telemetry-tire-badge" style={{ borderColor: TIRE_COLORS[car.tire], color: TIRE_COLORS[car.tire] }}>{car.tire}</span>
            </div>
          </div>
        </div>

        {/* Throttle / brake */}
        <div className="space-y-1.5 telemetry-bars-space">
          <BarLabel label="Throttle" value={car.throttle} color="hsl(var(--f1-green))" />
          <BarLabel label="Brake" value={car.brake} color="hsl(var(--f1-red))" />
        </div>
      </div>
    </div>
  );
}

function BarLabel({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[9px] panel-title mb-0.5 telemetry-bar-label">
        <span>{label}</span>
        <span className="mono">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2 bg-secondary telemetry-bar-height">
        <div className="h-full transition-all duration-150" style={{ width: `${value * 100}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
    </div>
  );
}

function SpeedGauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(1, value));
  const r = 56;
  const cx = 70, cy = 70;
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
    <svg viewBox="0 0 140 100" className="w-full h-full">
      <path d={path(0, 1)} stroke="hsl(var(--secondary))" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d={path(0, v)} stroke="hsl(var(--primary))" strokeWidth="6" fill="none" strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 4px hsl(var(--f1-red-glow)))" }} />
    </svg>
  );
}
