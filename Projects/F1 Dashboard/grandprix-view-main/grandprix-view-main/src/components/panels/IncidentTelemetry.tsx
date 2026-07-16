import { AlertTriangle, Gauge, ShieldAlert } from "lucide-react";

interface DriverTelemetry {
  name: string;
  throttle: number;
  brake: number;
  damage: number;
  color: string;
}

interface IncidentStats {
  gForce: string;
  impactSpeed: string;
  verdict: string;
  severity: "Critical" | "Major" | "Info";
  drivers: DriverTelemetry[];
}

const STATS_MAP: Record<string, IncidentStats> = {
  "Sainte Dévote": {
    gForce: "32.4 G",
    impactSpeed: "242 km/h",
    verdict: "No further action (Racing Incident)",
    severity: "Critical",
    drivers: [
      { name: "PER", throttle: 40, brake: 80, damage: 100, color: "#1E40AF" },
      { name: "MAG", throttle: 98, brake: 0, damage: 100, color: "#B6BABD" },
      { name: "HUL", throttle: 15, brake: 90, damage: 100, color: "#B6BABD" },
    ],
  },
  "Casino Square": {
    gForce: "4.8 G",
    impactSpeed: "160 km/h",
    verdict: "No further action (Racing Incident)",
    severity: "Major",
    drivers: [
      { name: "SAI", throttle: 35, brake: 70, damage: 15, color: "#DC2626" },
      { name: "PIA", throttle: 45, brake: 60, damage: 10, color: "#F97316" },
    ],
  },
  "Portier": {
    gForce: "12.1 G",
    impactSpeed: "85 km/h",
    verdict: "10s penalty for Oco (+5 grid drop for Canada)",
    severity: "Major",
    drivers: [
      { name: "OCO", throttle: 60, brake: 20, damage: 75, color: "#EC4899" },
      { name: "GAS", throttle: 40, brake: 50, damage: 5, color: "#EC4899" },
    ],
  },
  "Full lap": {
    gForce: "4.1 G",
    impactSpeed: "291 km/h (Peak)",
    verdict: "Clean Lap - Point Awarded",
    severity: "Info",
    drivers: [
      { name: "HAM", throttle: 100, brake: 55, damage: 0, color: "#06B6D4" },
    ],
  },
};

export default function IncidentTelemetry({ incident }: { incident: any }) {
  if (!incident) return null;

  const stats = STATS_MAP[incident.turn] || {
    gForce: "N/A",
    impactSpeed: "N/A",
    verdict: "Under Investigation",
    severity: "Info",
    drivers: incident.drivers.map((d: string) => ({
      name: d.toUpperCase().slice(0, 3),
      throttle: 50,
      brake: 50,
      damage: 10,
      color: "#ffffff"
    }))
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "Critical": return "text-[#e8002d] border-[#e8002d] bg-[#e8002d]/10";
      case "Major": return "text-orange-500 border-orange-500 bg-orange-500/10";
      default: return "text-cyan-500 border-cyan-500 bg-cyan-500/10";
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-full w-full select-none text-white overflow-y-auto py-1 custom-scrollbar incident-telemetry-grid">
      {/* Col 1: Collision Metrics */}
      <div className="flex flex-col justify-between border-r border-white/5 pr-4 incident-col-1">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
              Telemetry Impact
            </span>
          </div>
          <h3 className="text-sm font-semibold uppercase text-white truncate">
            {incident.turn}
          </h3>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5 font-bold">
            Lap {incident.lap} · {incident.type.replace("_", " ")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 incident-impact-grid">
          <div className="bg-white/5 border border-white/5 p-2 rounded-md incident-impact-box">
            <span className="text-[8px] text-muted-foreground uppercase tracking-wider block font-bold">Peak G-Force</span>
            <span className="text-sm font-semibold tracking-tight mt-0.5 block mono">{stats.gForce}</span>
          </div>
          <div className="bg-white/5 border border-white/5 p-2 rounded-md incident-impact-box">
            <span className="text-[8px] text-muted-foreground uppercase tracking-wider block font-bold">Impact Speed</span>
            <span className="text-sm font-semibold tracking-tight mt-0.5 block mono">{stats.impactSpeed}</span>
          </div>
        </div>
      </div>

      {/* Col 2: Driver Telemetry Comparison */}
      <div className="flex flex-col justify-between border-r border-white/5 pr-4 incident-col-2">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Gauge className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 font-bold">
              Contact Traces
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-2.5">
          {stats.drivers.map((d) => (
            <div key={d.name} className="space-y-1">
              <div className="flex items-center justify-between text-[8px] font-bold">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: d.color }} />
                  <span className="text-white uppercase tracking-wider font-mono">{d.name}</span>
                </div>
                <div className="flex gap-2 text-muted-foreground">
                  <span>THR: <strong className="text-white mono">{d.throttle}%</strong></span>
                  <span>BRK: <strong className="text-white mono">{d.brake}%</strong></span>
                </div>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                <div className="h-full rounded-l" style={{ width: `${d.throttle}%`, backgroundColor: "#00E676" }} />
                <div className="h-full rounded-r" style={{ width: `${d.brake}%`, backgroundColor: "#e8002d" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Col 3: Verdict & Damage */}
      <div className="flex flex-col justify-between incident-col-3">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
              Stewards Verdict
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end space-y-2.5">
          {/* Damage bars */}
          <div className="space-y-1">
            <span className="text-[8px] text-muted-foreground uppercase tracking-wider block mb-0.5 font-bold">Damage Severity</span>
            <div className="flex gap-2 incident-damage-row">
              {stats.drivers.map((d) => (
                <div key={d.name} className="flex-1 bg-white/5 border border-white/5 p-1 px-1.5 rounded flex items-center justify-between incident-damage-box">
                  <span className="text-[8px] font-bold mono text-muted-foreground">{d.name}</span>
                  <span className={`text-[9px] font-semibold mono ${d.damage > 50 ? "text-[#e8002d]" : d.damage > 10 ? "text-orange-500" : "text-green-500"}`}>
                    {d.damage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verdict Text */}
          <div className="bg-white/5 border border-white/5 p-2 rounded-md incident-verdict-box">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[8px] text-muted-foreground uppercase tracking-wider font-bold">Decision</span>
              <span className={`text-[7px] font-semibold px-1 py-0.5 rounded border uppercase leading-none ${getSeverityColor(stats.severity)}`}>
                {stats.severity}
              </span>
            </div>
            <p className="text-[9px] font-semibold text-white/95 leading-tight line-clamp-2">
              {stats.verdict}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
