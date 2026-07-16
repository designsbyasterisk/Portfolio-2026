import { cn } from "@/lib/utils";
import type { CompanionState } from "@/lib/types";

interface Props {
  companion: CompanionState;
  size?: number;
  className?: string;
}

/**
 * Pure-SVG companion. Stages: seed → sprout → bloom → tree.
 * Vitality affects color saturation and a gentle wilt.
 */
export function CompanionSprite({ companion, size = 88, className }: Props) {
  const dim = companion.vitality < 40;
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-label={`${companion.name}, ${companion.stage}`}
    >
      <div
        className="absolute inset-0 rounded-full bg-gradient-ember opacity-30 blur-xl animate-ember-pulse"
        style={{ transform: dim ? "scale(0.7)" : "scale(1)" }}
      />
      <svg viewBox="0 0 100 100" width={size} height={size} className="relative">
        <defs>
          <linearGradient id="leaf" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--sage))" />
            <stop offset="100%" stopColor="hsl(145 50% 35%)" />
          </linearGradient>
          <linearGradient id="bloom" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary-glow))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
        {/* Pot */}
        <ellipse cx="50" cy="88" rx="22" ry="4" fill="hsl(20 30% 80% / 0.5)" />
        <path d="M32 78 L68 78 L64 92 L36 92 Z" fill="hsl(20 40% 55%)" />
        {/* Soil */}
        <ellipse cx="50" cy="78" rx="18" ry="3" fill="hsl(20 35% 25%)" />

        {companion.stage === "seed" && (
          <circle cx="50" cy="76" r="3" fill="hsl(35 60% 35%)" />
        )}

        {companion.stage === "sprout" && (
          <>
            <path d="M50 78 Q50 65 50 55" stroke="url(#leaf)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M50 62 Q42 56 38 60" stroke="url(#leaf)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M50 58 Q58 52 62 56" stroke="url(#leaf)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}

        {companion.stage === "bloom" && (
          <>
            <path d="M50 78 Q50 60 50 45" stroke="url(#leaf)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <ellipse cx="42" cy="58" rx="8" ry="4" fill="url(#leaf)" transform="rotate(-25 42 58)" />
            <ellipse cx="58" cy="55" rx="8" ry="4" fill="url(#leaf)" transform="rotate(25 58 55)" />
            <circle cx="50" cy="40" r="9" fill="url(#bloom)" />
            <circle cx="50" cy="40" r="3" fill="hsl(50 90% 70%)" />
          </>
        )}

        {companion.stage === "tree" && (
          <>
            <rect x="47" y="55" width="6" height="25" rx="2" fill="hsl(20 40% 35%)" />
            <circle cx="50" cy="40" r="20" fill="url(#leaf)" />
            <circle cx="38" cy="42" r="10" fill="hsl(145 35% 50%)" />
            <circle cx="62" cy="42" r="10" fill="hsl(145 35% 50%)" />
            <circle cx="44" cy="32" r="3" fill="url(#bloom)" />
            <circle cx="58" cy="36" r="3" fill="url(#bloom)" />
            <circle cx="52" cy="28" r="3" fill="url(#bloom)" />
          </>
        )}
      </svg>
    </div>
  );
}
