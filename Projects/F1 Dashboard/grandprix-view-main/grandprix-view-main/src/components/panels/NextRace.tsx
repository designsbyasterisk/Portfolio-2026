import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Thermometer, Wind } from "lucide-react";
import { nextRace } from "@/data/f1Mock";

const ICONS: Record<string, typeof Sun> = { sun: Sun, cloud: Cloud, rain: CloudRain };

export default function NextRace() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const target = new Date(nextRace.date).getTime();
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="panel p-3 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="panel-title">Next Round</div>
          <div className="text-sm font-bold mt-1 leading-tight">{nextRace.name}</div>
          <div className="text-[10px] text-muted-foreground tracking-wider uppercase">{nextRace.circuit}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] panel-title">Round</div>
          <div className="text-xl font-semibold mono text-primary">{nextRace.round}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {[
          { l: "DAYS", v: d }, { l: "HRS", v: h }, { l: "MIN", v: m }, { l: "SEC", v: s },
        ].map((b) => (
          <div key={b.l} className="bg-secondary/60 p-1.5 text-center">
            <div className="text-base font-semibold mono text-foreground leading-none">{String(b.v).padStart(2, "0")}</div>
            <div className="text-[8px] panel-title mt-0.5">{b.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
        <Stat icon={<Thermometer className="w-3 h-3" />} label="Track" value={`${nextRace.weather.trackTemp}°C`} />
        <Stat icon={<Wind className="w-3 h-3" />} label="Air" value={`${nextRace.weather.airTemp}°C`} />
        <Stat icon={<CloudRain className="w-3 h-3" />} label="Rain" value={`${nextRace.weather.rainChance}%`} />
      </div>

      <div className="flex gap-1">
        {nextRace.weather.forecast.map((f) => {
          const Icon = ICONS[f.icon];
          return (
            <div key={f.day} className="flex-1 bg-secondary/40 p-1.5 text-center">
              <div className="text-[9px] panel-title">{f.day}</div>
              <Icon className="w-4 h-4 mx-auto my-1 text-primary" />
              <div className="text-[10px] mono"><span className="text-foreground">{f.high}°</span> <span className="text-muted-foreground">{f.low}°</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-secondary/60 p-1.5">
      <div className="flex items-center gap-1 text-muted-foreground">{icon}<span className="text-[8px] tracking-widest uppercase">{label}</span></div>
      <div className="text-sm font-bold mono mt-0.5">{value}</div>
    </div>
  );
}
