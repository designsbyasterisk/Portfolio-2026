import { useEffect, useState, useRef } from "react";
import { useReplay, getFrameAt } from "@/hooks/useReplay";
import { AlertCircle } from "lucide-react";

interface TickerMessage {
  lap: number;
  text: string;
  type: "control" | "incident" | "fastest_lap" | "pit_stop";
}

const TICKER_MESSAGES: TickerMessage[] = [
  { lap: 1, type: "control", text: "YELLOW FLAG WAVED IN SECTOR 1 (BEAU RIVAGE)" },
  { lap: 1, type: "incident", text: "COLLISION IN SECTOR 1: CAR 11 (PER), CAR 20 (MAG) AND CAR 27 (HUL) - RED FLAG DECLARED" },
  { lap: 1, type: "incident", text: "COLLISION AT PORTIER INVOLVING CAR 31 (OCO) AND CAR 10 (GAS)" },
  { lap: 1, type: "control", text: "STEWARDS: PORTIER COLLISION INVOLVING CAR 31 (OCO) AND CAR 10 (GAS) TO BE INVESTIGATED AFTER THE RACE" },
  { lap: 1, type: "control", text: "RED FLAG: SESSION SUSPENDED. REPAIRS TO TECPRO BARRIERS UNDERWAY" },
  { lap: 1, type: "control", text: "CAR 31 (OCO) SUSPECTED CHASSIS DAMAGE - RETIRED FROM RACE" },
  { lap: 1, type: "control", text: "CAR 55 (SAI) POSITION RESTORED FOR RESTART (LAP 1 ORDER NOT FULLY ESTABLISHED)" },
  { lap: 2, type: "control", text: "STANDING RESTART COMPLETED. LECLERC LEADS PIASTRI AND SAINZ" },
  { lap: 2, type: "control", text: "DRS ENABLED BY RACE CONTROL" },
  { lap: 10, type: "control", text: "STEWARDS: 10-SECOND PENALTY FOR CAR 31 (OCO) FOR CAUSING A COLLISION — CONVERTED TO A 5-PLACE GRID DROP FOR CANADA" },
  { lap: 15, type: "control", text: "STEWARDS: TRACK LIMITS WARNING FOR CAR 1 (VER) AT TURN 10" },
  { lap: 16, type: "pit_stop", text: "PIT STOP: CAR 77 (BOT) — HARD TO MEDIUM (2.4s)" },
  { lap: 28, type: "control", text: "STEWARDS: TRACK LIMITS WARNING FOR CAR 44 (HAM) AT TURN 5" },
  { lap: 35, type: "control", text: "STEWARDS: TRACK LIMITS WARNING FOR CAR 16 (LEC) AT TURN 10" },
  { lap: 43, type: "control", text: "STEWARDS: BLACK AND WHITE FLAG FOR CAR 18 (STR) - TRACK LIMITS WARNING" },
  { lap: 50, type: "incident", text: "CAR 18 (STR) TOUCHED WALL AT CHICANE - REAR-LEFT PUNCTURE REPORTED" },
  { lap: 50, type: "control", text: "STEWARDS: INCIDENT INVOLVING CAR 18 (STR) AND CHICANE BARRIER NOTED" },
  { lap: 50, type: "pit_stop", text: "PIT STOP: CAR 18 (STR) - REAR-LEFT TYRE DAMAGE REPLACEMENT (11.8s)" },
  { lap: 52, type: "pit_stop", text: "PIT STOP: CAR 44 (HAM) — MEDIUM TO HARD (2.3s)" },
  { lap: 53, type: "pit_stop", text: "PIT STOP: CAR 1 (VER) — HARD TO MEDIUM (2.1s)" },
  { lap: 63, type: "fastest_lap", text: "FASTEST LAP SET BY CAR 44 (HAM) - 1:14.165" },
  { lap: 68, type: "control", text: "STEWARDS: TRACK LIMITS WARNING FOR CAR 4 (NOR) AT TURN 10" },
  { lap: 76, type: "fastest_lap", text: "NEW FASTEST LAP SET BY CAR 44 (HAM) - 1:13.565" },
  { lap: 78, type: "control", text: "CHEQUERED FLAG WAVED — CHARLES LECLERC WINS THE MONACO GRAND PRIX 2024!" }
];

export default function RaceControlTicker() {
  const [currentLap, setCurrentLap] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(150);

  // Sync lap with replay timer
  useEffect(() => {
    const id = setInterval(() => {
      const t = useReplay.getState().time;
      const leader = getFrameAt(t).cars.find((c) => c.position === 1);
      if (leader) {
        setCurrentLap(leader.lap);
      }
    }, 250);
    return () => clearInterval(id);
  }, []);

  // Filter messages that have occurred up to the current lap
  const visibleMessages = TICKER_MESSAGES.filter((msg) => msg.lap <= currentLap);
  
  // Compile scrolling text string
  const scrollText = visibleMessages.length > 0 
    ? visibleMessages.map((msg) => `[LAP ${msg.lap}] ${msg.text}`).reverse().join("  •  ")
    : "RACE ACTIVE  •  NO LIVE INCIDENTS REPORTED";

  // Calculate dynamic duration to keep scroll speed constant and slow (approx. 30px/s)
  useEffect(() => {
    if (textRef.current) {
      const width = textRef.current.offsetWidth || textRef.current.scrollWidth;
      if (width > 0) {
        const speed = 30; // Constant speed in pixels per second (slower and more readable)
        const calculatedDuration = (width * 1.1) / speed;
        // Keep a minimum duration of 60 seconds to ensure short text moves very gently
        setDuration(Math.max(calculatedDuration, 60));
      }
    }
  }, [scrollText]);

  return (
    <div className="flex items-center w-full h-full bg-[#0c0c0f] border-l-4 border-primary px-4 py-2 overflow-hidden select-none">
      {/* Title Badge */}
      <div className="flex items-center gap-2 shrink-0 border-r border-white/10 pr-4 mr-4">
        <AlertCircle className="w-3.5 h-3.5 text-primary animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
          Race Control
        </span>
      </div>

      {/* Ticker scrolling content */}
      <div className="flex-1 overflow-hidden relative" ref={scrollRef}>
        <div 
          ref={textRef}
          className="whitespace-nowrap inline-block animate-marquee select-text"
          style={{ animationDuration: `${duration}s` }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
            {scrollText}
          </span>
        </div>
      </div>

      {/* CSS style injected for custom marquee animations */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(10%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 150s linear infinite;
        }
      `}</style>
    </div>
  );
}
