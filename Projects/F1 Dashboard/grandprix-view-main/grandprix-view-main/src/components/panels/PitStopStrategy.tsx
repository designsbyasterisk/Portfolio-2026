import { useEffect, useState } from "react";
import { useReplay, getFrameAt } from "@/hooks/useReplay";
import { Disc } from "lucide-react";
import { drivers } from "@/data/f1Mock";

const PIT_EVENTS = [
  { driverId: "bot", lap: 16, from: "H", to: "M", duration: "2.4s" },
  { driverId: "str", lap: 50, from: "H", to: "M", duration: "11.8s (damage)" },
  { driverId: "ham", lap: 52, from: "M", to: "H", duration: "2.3s" },
  { driverId: "ver", lap: 53, from: "H", to: "M", duration: "2.1s" },
];

const PIT_LAPS: Record<string, number> = {
  bot: 16,
  str: 50,
  ham: 52,
  ver: 53,
};

function getTireColors(compound: string) {
  switch (compound) {
    case "S": return { stripe: "#e8002d", text: "#ff4d6d", bg: "rgba(232, 0, 45, 0.1)" };
    case "M": return { stripe: "#ffd100", text: "#ffd43b", bg: "rgba(252, 196, 25, 0.1)" };
    case "H": return { stripe: "#ffffff", text: "#ffffff", bg: "rgba(255, 255, 255, 0.1)" };
    default: return { stripe: "#888888", text: "#aaaaaa", bg: "rgba(255, 255, 255, 0.05)" };
  }
}

function getTireName(compound: string) {
  switch (compound) {
    case "S": return "Soft";
    case "M": return "Medium";
    case "H": return "Hard";
    default: return "Unknown";
  }
}

export default function PitStopStrategy() {
  const focusedId = useReplay((s) => s.focusedDriverId);
  const [currentFrame, setCurrentFrame] = useState<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const t = useReplay.getState().time;
      const frame = getFrameAt(t);
      setCurrentFrame(frame);
    }, 250);
    return () => clearInterval(id);
  }, []);

  // Reset flip state when changing driver
  useEffect(() => {
    setIsFlipped(false);
  }, [focusedId]);

  const car = currentFrame?.cars.find((c: any) => c.driverId === focusedId);
  const activeMeta = drivers.find((d) => d.id === focusedId);

  if (!car) {
    return (
      <div className="flex h-full items-center justify-center text-[9px] text-muted-foreground uppercase tracking-wider">
        Loading strategy...
      </div>
    );
  }

  // Calculate tyre age
  let tireAge = 1;
  if (car.lap > 1) {
    const pitLap = PIT_LAPS[focusedId];
    if (pitLap && car.lap > pitLap) {
      tireAge = car.lap - pitLap;
    } else {
      // Most drivers pitted under red flag on Lap 1
      tireAge = car.lap - 1;
    }
  }

  // Find historical pit events for the selected driver
  const driverPits = PIT_EVENTS.filter((e) => e.driverId === focusedId && car.lap >= e.lap);
  const lastPit = [...PIT_EVENTS].reverse().find((e) => e.driverId === focusedId && car.lap >= e.lap);
  const colors = getTireColors(car.tire);

  return (
    <div 
      className="w-full h-full flex items-center justify-center select-none cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      title="Click to flip strategy card"
    >
      {/* 3D Card Container */}
      <div className={`relative pit-tire-card-3d ${isFlipped ? "flipped" : ""}`}>
        {/* Card Inner Wrapper */}
        <div className="pit-tire-card-inner w-full h-full">
          
          {/* Front Face: The Tire */}
          <div className="pit-tire-card-front w-full h-full relative">
            {/* Full Tyre SVG Background */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none select-none">
              {/* Outer subtle border */}
              <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              {/* Solid Tyre body */}
              <circle cx="100" cy="100" r="92" fill="#08080a" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
              {/* Split colored ring (150 deg arch, 30 deg gap) */}
              <circle 
                cx="100" 
                cy="100" 
                r="76" 
                fill="none" 
                stroke={colors.stripe} 
                strokeWidth="7" 
                strokeLinecap="butt"
                strokeDasharray="198.9 39.8" 
                transform="rotate(-75, 100, 100)"
                style={{ filter: `drop-shadow(0 0 3px ${colors.stripe}60)` }}
              />
            </svg>
            
            {/* Strategy details positioned inside the tire */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              {/* Driver Badge */}
              {activeMeta && (
                <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold font-mono text-white/90 mb-1 leading-none">
                  #{activeMeta.number} {activeMeta.code}
                </div>
              )}
              
              {/* Compound Letter (Giant White text matching F1 style) */}
              <span className="text-6xl font-black leading-none select-none text-white my-1 font-display tracking-tight">
                {car.tire}
              </span>

              {/* Age */}
              <div className="text-[9px] font-bold text-white/75 uppercase tracking-widest leading-none mt-1">
                {tireAge} Laps
              </div>

              {/* Stop Duration Badge */}
              {lastPit && (
                <div className="px-1.5 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-[8px] font-bold font-mono tracking-wide mt-2.5 leading-none">
                  {lastPit.duration}
                </div>
              )}

              {/* Flip Hint */}
              <div className="text-[5.5px] text-white/20 tracking-[0.15em] uppercase mt-2.5 leading-none animate-pulse">
                Click to flip
              </div>
            </div>
          </div>

          {/* Back Face: The Pit History */}
          <div className="pit-tire-card-back w-full h-full relative p-6 flex flex-col items-center justify-center">
            {/* Full Tyre SVG Background (matching front for consistency) */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
              <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <circle cx="100" cy="100" r="92" fill="#08080a" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
              <circle 
                cx="100" 
                cy="100" 
                r="76" 
                fill="none" 
                stroke={colors.stripe} 
                strokeWidth="7" 
                strokeLinecap="butt"
                strokeDasharray="198.9 39.8" 
                transform="rotate(-75, 100, 100)"
                className="opacity-40"
              />
            </svg>

            {/* Back Face Content */}
            <div className="relative z-10 w-full flex flex-col items-center justify-center h-full">
              <div className="text-[12px] font-black uppercase tracking-[0.2em] mb-3 text-white/75">
                Pit History
              </div>

              {/* Timeline Scroll */}
              <div className="w-full max-h-[100px] overflow-y-auto scroll-area custom-scrollbar flex flex-col items-center gap-2 pr-1 select-none">
                {car.lap >= 1 && (
                  <div className="flex gap-2 items-center text-left w-[85%]">
                    <div className="w-2 h-2 rounded-full bg-white border border-[#e8002d] shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold uppercase text-white/95 leading-none">L1 Red Flag Pit</span>
                      <span class="text-[9px] text-white/60 uppercase mt-1 leading-none font-medium">Medium ➔ Hard</span>
                    </div>
                  </div>
                )}
                {driverPits.map((event, idx) => (
                  <div 
                    key={idx} 
                    className="flex gap-2 items-center text-left w-[85%]"
                  >
                    <div className="w-2 h-2 rounded-full bg-yellow-300 border border-[#e8002d] shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold uppercase text-white/95 leading-none">Lap {event.lap} Stop</span>
                      <span class="text-[9px] text-white/60 uppercase mt-1 leading-none font-medium">
                        {getTireName(event.from)} ➔ {getTireName(event.to)} ({event.duration})
                      </span>
                    </div>
                  </div>
                ))}
                {driverPits.length === 0 && car.lap < 1 && (
                  <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest py-2">No Pit Stops</span>
                )}
              </div>

              {/* Click to Flip Back Hint */}
              <div className="text-[7px] text-white/30 tracking-[0.15em] uppercase mt-3.5 leading-none animate-pulse">
                Click to show tyre
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
