import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { drivers, lapHistory } from "@/data/f1Mock";
import { useReplay, getFrameAt } from "@/hooks/useReplay";
import { Timer } from "lucide-react";

export default function LapTimingChart() {
  const focused = useReplay((s) => s.focusedDriverId);
  const time = useReplay((s) => s.time);

  // Show top 4: focused + first 3 others
  const ids = useMemo(() => {
    const set = [focused, ...drivers.filter(d => d.id !== focused).slice(0, 3).map(d => d.id)];
    return Array.from(new Set(set));
  }, [focused]);

  // Retrieve current frame to get real-time driver lap numbers
  const currentFrame = useMemo(() => getFrameAt(time), [time]);

  const data = useMemo(() => {
    // Get the current lap number for each driver in the frame
    const driverLaps: Record<string, number> = {};
    ids.forEach(id => {
      const car = currentFrame?.cars?.find(c => c.driverId === id);
      driverLaps[id] = car ? car.lap : 1;
    });

    // Find max completed lap among the tracked drivers
    const maxLap = Math.max(...ids.map(id => {
      const completedLaps = driverLaps[id] - 1;
      return Math.min(completedLaps, lapHistory[id]?.length || 0);
    }));

    const rows: Record<string, number>[] = [];
    for (let i = 0; i < maxLap; i++) {
      const row: Record<string, number> = { lap: i + 1 };
      ids.forEach(id => {
        const hist = lapHistory[id];
        if (hist) {
          const e = hist[i];
          if (e) {
            row[id] = +(e.ms / 1000).toFixed(3);
          }
        }
      });
      rows.push(row);
    }
    return rows;
  }, [ids, currentFrame]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2.5 px-1 shrink-0">
        <div className="text-[12px] font-semibold tracking-[0.2em] uppercase text-black flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-primary" /> Lap Timing · Top Pace
        </div>
        <div className="text-[9px] mono text-black/60 tracking-widest font-bold">SECONDS</div>
      </div>
      <div className="flex-1 min-h-0 relative no-drag">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <span className="text-[11px] font-bold text-black/60 uppercase tracking-widest animate-pulse">Waiting for lap completion...</span>
            <span className="text-[9px] text-black/40 uppercase tracking-wider mt-1">Laps will plot once drivers cross the line</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 12, left: -22, bottom: 0 }}>
              <CartesianGrid stroke="rgba(0,0,0,0.1)" strokeDasharray="2 4" vertical={false} />
              <XAxis 
                dataKey="lap" 
                stroke="rgba(0,0,0,0.5)" 
                tick={{ fontSize: 9, fontFamily: "monospace" }} 
                tickLine={false} 
                axisLine={{ stroke: "rgba(0,0,0,0.1)" }} 
              />
              <YAxis 
                stroke="rgba(0,0,0,0.5)" 
                tick={{ fontSize: 9, fontFamily: "monospace" }} 
                tickLine={false} 
                axisLine={{ stroke: "rgba(0,0,0,0.1)" }} 
                domain={["dataMin - 0.2", "dataMax + 0.2"]} 
              />
              <Tooltip
                contentStyle={{ 
                  background: "#ffffff", 
                  border: "1px solid rgba(0, 0, 0, 0.1)", 
                  borderRadius: "4px", 
                  fontSize: 10,
                  fontFamily: "sans-serif",
                  color: "#000"
                }}
                labelStyle={{ color: "rgba(0, 0, 0, 0.6)", textTransform: "uppercase", letterSpacing: 2, fontSize: 8, fontWeight: "bold" }}
                itemStyle={{ padding: "1px 0" }}
              />
              <Legend 
                wrapperStyle={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, paddingTop: 4 }} 
                iconSize={8}
                iconType="circle"
              />
              {ids.map(id => {
                const d = drivers.find(x => x.id === id)!;
                if (!d) return null;
                return (
                  <Line 
                    key={id} 
                    type="monotone" 
                    dataKey={id} 
                    name={d.code} 
                    stroke={d.color} 
                    strokeWidth={focused === id ? 2 : 1.2} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
