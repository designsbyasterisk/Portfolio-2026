import { useState, useMemo, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { drivers, lapHistory } from "@/data/f1Mock";
import { useReplay, getFrameAt } from "@/hooks/useReplay";
import { Users } from "lucide-react";

const TEAMS = [
  { name: "Ferrari", color: "#DC2626" },
  { name: "McLaren", color: "#F97316" },
  { name: "Mercedes", color: "#06B6D4" },
  { name: "Red Bull", color: "#1E40AF" },
  { name: "RB", color: "#3B82F6" },
  { name: "Aston Martin", color: "#10B981" },
  { name: "Alpine", color: "#EC4899" },
  { name: "Sauber", color: "#52E252" },
  { name: "Williams", color: "#0EA5E9" },
  { name: "Haas", color: "#B6BABD" }
];

export default function TeamComparison() {
  const time = useReplay((s) => s.time);
  const [selectedTeam, setSelectedTeam] = useState("Ferrari");
  
  // Force update chart sync
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 500);
    return () => clearInterval(id);
  }, []);

  const teamDrivers = useMemo(() => {
    return drivers.filter((d) => d.team === selectedTeam);
  }, [selectedTeam]);

  const d1 = teamDrivers[0];
  const d2 = teamDrivers[1];

  const chartData = useMemo(() => {
    if (!d1 || !d2) return [];
    const hist1 = lapHistory[d1.id] || [];
    const hist2 = lapHistory[d2.id] || [];
    
    const frame = getFrameAt(time);
    const car1 = frame?.cars?.find((c: any) => c.driverId === d1.id);
    const car2 = frame?.cars?.find((c: any) => c.driverId === d2.id);
    
    const currentLap1 = car1 ? car1.lap : 1;
    const currentLap2 = car2 ? car2.lap : 1;

    const maxLap1 = car1?.retired ? hist1.length : Math.min(currentLap1 - 1, hist1.length);
    const maxLap2 = car2?.retired ? hist2.length : Math.min(currentLap2 - 1, hist2.length);
    const maxLap = Math.max(maxLap1, maxLap2);

    if (maxLap <= 0) return [];

    const rows = [];
    for (let i = 0; i < maxLap; i++) {
      rows.push({
        lap: i + 1,
        [d1.code]: i < maxLap1 && hist1[i] ? +(hist1[i].ms / 1000).toFixed(3) : null,
        [d2.code]: i < maxLap2 && hist2[i] ? +(hist2[i].ms / 1000).toFixed(3) : null,
      });
    }
    return rows;
  }, [d1, d2, time]);

  const renderLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <div className="flex justify-center gap-4 text-[9px] uppercase tracking-widest font-bold pt-2 select-none">
        {payload.map((entry: any, index: number) => {
          const isDashed = entry.value === d2?.code;
          return (
            <div key={`item-${index}`} className="flex items-center gap-1.5" style={{ color: entry.color }}>
              {isDashed ? (
                <div className="flex gap-0.5 items-center">
                  <span className="w-1.5 h-[2px]" style={{ backgroundColor: entry.color }} />
                  <span className="w-1.5 h-[2px]" style={{ backgroundColor: entry.color }} />
                  <span className="w-1.5 h-[2px]" style={{ backgroundColor: entry.color }} />
                </div>
              ) : (
                <span className="w-5 h-[2px]" style={{ backgroundColor: entry.color }} />
              )}
              <span className="text-white/80">{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  };


  return (
    <div className="flex flex-col h-full text-white">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-3.5 px-1 shrink-0">
        <div className="text-[12px] card-title-adaptive font-semibold tracking-[0.2em] uppercase text-white flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-primary" /> Teammate Battle
        </div>
        
        {/* Dropdown for Team Selection */}
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="bg-[#121212] border border-white/10 hover:border-primary/60 px-2 py-0.5 text-[9px] rounded text-white font-bold uppercase tracking-wider focus:outline-none focus:border-primary select-none no-drag pointer-events-auto"
        >
          {TEAMS.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {d1 && d2 ? (
        <div className="flex-1 overflow-y-auto space-y-3.5 -mr-1 pr-1 custom-scrollbar flex flex-col">
          {/* Teammate Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold shrink-0">
            {/* Driver 1 Stats */}
            <div className="bg-white/5 rounded-sm p-2 flex flex-col gap-1 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: d1.color }} />
              <span className="text-[10px] font-extrabold uppercase truncate tracking-wider pl-1.5">{d1.code}</span>
              <div className="grid grid-cols-2 text-[9px] text-white/60 pt-1 border-t border-white/5 mt-0.5">
                <div className="flex flex-col items-center">
                  <span className="text-[7px] text-white/40 uppercase tracking-widest font-bold">Grid</span>
                  <span className="font-bold mono text-white">P{d1.startGrid}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[7px] text-white/40 uppercase tracking-widest font-bold">Finish</span>
                  <span className="font-bold mono text-white">P{d1.finish}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 text-[9px] text-white/60 mt-1">
                <div className="flex flex-col items-center">
                  <span className="text-[7px] text-white/40 uppercase tracking-widest font-bold">Delta</span>
                  <span className={`font-bold mono ${d1.delta > 0 ? "text-emerald-400" : d1.delta < 0 ? "text-rose-400" : "text-white"}`}>
                    {d1.delta > 0 ? `+${d1.delta}` : d1.delta}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[7px] text-white/40 uppercase tracking-widest font-bold">Points</span>
                  <span className="font-bold mono text-primary">{d1.points} PTS</span>
                </div>
              </div>
            </div>

            {/* Driver 2 Stats */}
            <div className="bg-white/5 rounded-sm p-2 flex flex-col gap-1 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: d2.color }} />
              <span className="text-[10px] font-extrabold uppercase truncate tracking-wider pl-1.5">{d2.code}</span>
              <div className="grid grid-cols-2 text-[9px] text-white/60 pt-1 border-t border-white/5 mt-0.5">
                <div className="flex flex-col items-center">
                  <span className="text-[7px] text-white/40 uppercase tracking-widest font-bold">Grid</span>
                  <span className="font-bold mono text-white">P{d2.startGrid}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[7px] text-white/40 uppercase tracking-widest font-bold">Finish</span>
                  <span className="font-bold mono text-white">P{d2.finish}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 text-[9px] text-white/60 mt-1">
                <div className="flex flex-col items-center">
                  <span className="text-[7px] text-white/40 uppercase tracking-widest font-bold">Delta</span>
                  <span className={`font-bold mono ${d2.delta > 0 ? "text-emerald-400" : d2.delta < 0 ? "text-rose-400" : "text-white"}`}>
                    {d2.delta > 0 ? `+${d2.delta}` : d2.delta}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[7px] text-white/40 uppercase tracking-widest font-bold">Points</span>
                  <span className="font-bold mono text-primary">{d2.points} PTS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="flex-1 min-h-[180px] relative no-drag pb-1">
            {chartData.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest animate-pulse">
                  Pace Comparison Loading...
                </span>
                <span className="text-[8px] text-white/20 uppercase tracking-wider mt-1">
                  Laps will plot once drivers complete sector lines
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 12, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" vertical={false} />
                  <XAxis 
                    dataKey="lap" 
                    stroke="rgba(255,255,255,0.4)" 
                    tick={{ fontSize: 9, fontFamily: "monospace" }} 
                    tickLine={false} 
                    axisLine={{ stroke: "rgba(255,255,255,0.05)" }} 
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)" 
                    tick={{ fontSize: 9, fontFamily: "monospace" }} 
                    tickLine={false} 
                    axisLine={{ stroke: "rgba(255,255,255,0.05)" }} 
                    domain={["dataMin - 0.2", "dataMax + 0.2"]} 
                  />
                  <Tooltip
                    contentStyle={{ 
                      background: "#121212", 
                      border: "1px solid rgba(255, 255, 255, 0.1)", 
                      borderRadius: "4px", 
                      fontSize: 10,
                      fontFamily: "sans-serif",
                      color: "#fff"
                    }}
                    labelStyle={{ color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", letterSpacing: 2, fontSize: 8, fontWeight: "bold" }}
                    itemStyle={{ padding: "1px 0" }}
                  />
                  <Legend 
                    content={renderLegend}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={d1.code} 
                    name={d1.code} 
                    stroke={d1.color} 
                    strokeWidth={2} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey={d2.code} 
                    name={d2.code} 
                    stroke={d2.color} 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4"
                    dot={false} 
                    isAnimationActive={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[10px] text-muted-foreground uppercase">
          Select Team To Compare
        </div>
      )}
    </div>
  );
}
