import { cn } from "@/lib/utils";

interface Props {
  current: number;
  cap: number;
  size?: number;
  className?: string;
}

export function EmberRing({ current, cap, size = 220, className }: Props) {
  const safeCap = Math.max(1, cap);
  const progress = Math.min(1, current / safeCap);
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);
  const over = current > cap;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary-glow))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={over ? "hsl(var(--destructive))" : "url(#ring-grad)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-warm"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold tabular-nums text-foreground">{current}</span>
        <span className="text-sm text-muted-foreground mt-1">of {cap} today</span>
        {cap === 0 && <span className="text-xs text-sage mt-1 font-medium">smoke-free day 🌿</span>}
      </div>
    </div>
  );
}
