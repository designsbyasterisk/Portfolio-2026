import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useReplay, REPLAY_DURATION } from "@/hooks/useReplay";
import { getFrameAt } from "@/hooks/useReplay";
import { currentRace, getLapStartTime } from "@/data/f1Mock";

export default function PlaybackBar() {
  const { time, isPlaying, speed, togglePlay, setTime, setSpeed } = useReplay();
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 100);
    return () => clearInterval(id);
  }, []);
  const frame = getFrameAt(time);
  const lap = Math.max(...frame.cars.map((c) => c.lap));
  const pct = (time / REPLAY_DURATION) * 100;

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      {/* Replay / Restart from Lap 1 */}
      <button 
        onClick={() => setTime(0)} 
        title="Restart from Lap 1"
        className="text-muted-foreground hover:text-primary transition-colors pointer-events-auto no-drag"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Play / Pause */}
      <button 
        onClick={togglePlay} 
        className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors pointer-events-auto no-drag"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      {/* Lap Selection Dropdown */}
      <div className="flex items-center gap-1.5 pointer-events-auto no-drag">
        <select
          value={lap}
          onChange={(e) => setTime(getLapStartTime(Number(e.target.value)))}
          className="bg-[#121212] border border-white/10 hover:border-primary/60 px-2 py-1 text-[11px] rounded text-white font-bold focus:outline-none focus:border-primary cursor-pointer"
        >
          {Array.from({ length: currentRace.totalLaps }, (_, i) => i + 1).map((l) => (
            <option key={l} value={l} className="bg-[#121212]">
              Lap {l}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-muted-foreground font-bold select-none">
          / {currentRace.totalLaps}
        </span>
      </div>

      {/* Non-interactive progress bar */}
      <div className="flex-1 relative h-1.5 bg-white/10 rounded-full overflow-hidden select-none pointer-events-none">
        <div className="absolute left-0 top-0 h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>

      <div className="text-[10px] tracking-widest panel-title select-none">SPEED</div>
      <div className="flex gap-1">
        {[0.5, 1, 2, 4].map((s) => (
          <button 
            key={s} 
            onClick={() => setSpeed(s)} 
            className={`px-2 py-0.5 text-[10px] mono border pointer-events-auto no-drag ${
              speed === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}

