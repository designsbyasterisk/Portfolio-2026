import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cigarette, Sparkles, Wallet, Heart, Flame as FlameIcon } from "lucide-react";
import { useAppState } from "@/lib/useAppState";
import { summarize } from "@/lib/analytics";
import { selectNarration, markSeen } from "@/lib/narrator";
import { EmberRing } from "@/components/EmberRing";
import { CompanionSprite } from "@/components/CompanionSprite";
import { CravingSOS } from "@/components/CravingSOS";
import { TriggerDialog } from "@/components/TriggerDialog";
import type { CigaretteEvent, CravingEvent, Trigger } from "@/lib/types";
import { HEALTH_MILESTONES } from "@/lib/narrator/constants";
import { cn } from "@/lib/utils";

export default function Home() {
  const { state, update } = useAppState();
  const [sosOpen, setSosOpen] = useState(false);
  const [pendingTriggerId, setPendingTriggerId] = useState<string | null>(null);
  const summary = useMemo(() => summarize(state), [state]);

  const story = useMemo(
    () => selectNarration({ state, summary, surface: "home_story" }),
    [state, summary],
  );

  const moneyNarr = useMemo(
    () => selectNarration({ state, summary, surface: "stat_money" }),
    [state, summary],
  );
  const streakNarr = useMemo(
    () => selectNarration({ state, summary, surface: "stat_streak" }),
    [state, summary],
  );

  const healthMs = [...HEALTH_MILESTONES].reverse().find((m) => summary.streakDays * 24 >= m.hours) ?? HEALTH_MILESTONES[0];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const logCigarette = () => {
    const ev: CigaretteEvent = { id: crypto.randomUUID(), ts: Date.now() };
    update((s) => ({ ...s, cigarettes: [...s.cigarettes, ev] }));
    setPendingTriggerId(ev.id);
  };

  const logCravingBeat = () => {
    const ev: CravingEvent = { id: crypto.randomUUID(), ts: Date.now(), outcome: "beat" };
    update((s) => ({ ...s, cravings: [...s.cravings, ev], xp: s.xp + 10 }));
  };

  const logCravingSmoked = () => {
    const cig: CigaretteEvent = { id: crypto.randomUUID(), ts: Date.now() };
    const cr: CravingEvent = { id: crypto.randomUUID(), ts: Date.now(), outcome: "smoked" };
    update((s) => ({ ...s, cigarettes: [...s.cigarettes, cig], cravings: [...s.cravings, cr] }));
    setPendingTriggerId(cig.id);
  };

  const handleTriggerSelect = (trigger: Trigger) => {
    if (!pendingTriggerId) return;
    update((s) => ({
      ...s,
      cigarettes: s.cigarettes.map((c) => (c.id === pendingTriggerId ? { ...c, trigger } : c)),
    }));
    setPendingTriggerId(null);
  };

  // Mark story as seen so we rotate next time
  const onStoryShown = () => {
    if (story) update((s) => markSeen(s, story.id));
  };

  return (
    <div className="space-y-5 pt-2 animate-float-up stagger">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="text-2xl font-semibold tracking-tight font-quicksand">Day {summary.daysSinceStart + 1}</h1>
        </div>
        <div className="hover-scale relative">
          <div className="glow-blob bg-primary/30 w-16 h-16 top-0 left-0"></div>
          <CompanionSprite companion={state.companion} size={64} />
        </div>
      </div>

      {/* Ring */}
      <Card className="p-6 flex flex-col items-center gap-3 glass hover-lift relative overflow-hidden">
        <div className="glow-blob bg-primary/20 w-40 h-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 w-full flex flex-col items-center gap-3">
          <EmberRing current={summary.cigsToday} cap={summary.capToday} />
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          {summary.cigsToday <= summary.capToday
            ? summary.capToday === 0
              ? "Smoke-free zone. Every minute counts."
              : `${summary.capToday - summary.cigsToday} left in your envelope today.`
            : `${summary.cigsToday - summary.capToday} over cap — a wobble, not a fall.`}
        </p>
        </div>
      </Card>

      {/* Story of the day */}
      {story && (
        <Card
          className="p-5 glass border-0 hover-lift cursor-default relative overflow-hidden"
          onMouseEnter={onStoryShown}
        >
          <div className="glow-blob bg-accent/20 w-32 h-32 -top-10 -right-10"></div>
          <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary animate-ember-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wide">Story of the day</span>
          </div>
          <p className="text-base leading-relaxed font-medium">{story.text}</p>
          {story.source && <p className="text-[10px] text-muted-foreground mt-2 italic">— {story.source}</p>}
          </div>
        </Card>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <Button
          onClick={logCigarette}
          variant="outline"
          className="h-14 rounded-2xl glass hover:bg-white/10 press-scale transition-all"
        >
          <Cigarette className="h-4 w-4 mr-1" /> I smoked one
        </Button>
        <Button
          onClick={() => setSosOpen(true)}
          className="h-14 rounded-2xl bg-primary/20 backdrop-blur-xl border border-primary/30 text-foreground shadow-glow press-scale hover:bg-primary/30 transition-all"
        >
          <FlameIcon className="h-4 w-4 mr-1 text-primary" /> Craving SOS
        </Button>
      </div>

      {/* Stat strip (Bento Box Layout) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <StatCard
            icon={<FlameIcon className="h-5 w-5" />}
            tint="ember"
            big={`${summary.streakDays}`}
            label={summary.streakDays === 1 ? "day streak" : "days under cap"}
            narration={streakNarr?.text}
            layout="horizontal"
          />
        </div>
        <StatCard
          icon={<Wallet className="h-5 w-5" />}
          tint="sage"
          big={<><span className="mr-1 opacity-80 text-[0.6em] font-medium align-baseline">{state.profile.currency}</span>{summary.moneySavedTotal.toFixed(summary.moneySavedTotal < 10 ? 2 : 0)}</>}
          label="Saved"
          layout="vertical"
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          tint="sky"
          big={healthMs.title}
          label="Health"
          layout="vertical"
        />
      </div>

      <CravingSOS
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        onBeat={logCravingBeat}
        onSmoked={logCravingSmoked}
      />

      <TriggerDialog
        open={!!pendingTriggerId}
        onSelect={handleTriggerSelect}
        onClose={() => setPendingTriggerId(null)}
      />
    </div>
  );
}

function StatCard({
  icon, big, label, narration, tint, layout = "horizontal",
}: {
  icon: React.ReactNode; big: React.ReactNode; label: string; narration?: string; tint: "ember" | "sage" | "sky"; layout?: "horizontal" | "vertical";
}) {
  const tintBg = tint === "ember" ? "bg-accent/20" : tint === "sage" ? "bg-sage/20" : "bg-sky/20";
  const tintText = tint === "ember" ? "text-primary" : tint === "sage" ? "text-sage" : "text-sky";
  const glowClass = tint === "ember" ? "bg-accent/40" : tint === "sage" ? "bg-sage/40" : "bg-sky/40";
  
  return (
    <Card className="p-4 flex items-start gap-4 glass hover-lift relative overflow-hidden">
      <div className={`glow-blob w-32 h-32 top-0 right-0 translate-x-8 -translate-y-8 ${glowClass}`}></div>
      
      <div className={cn("relative z-10 flex w-full", layout === "horizontal" ? "gap-4 flex-row items-center" : "gap-3 flex-col items-start")}>
        <div className={cn("h-11 w-11 rounded-[14px] flex items-center justify-center shrink-0 backdrop-blur-md border border-white/10 shadow-sm", tintBg, tintText)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn("flex", layout === "horizontal" ? "items-baseline gap-2" : "flex-col gap-0.5")}>
            <span className={cn("font-bold tabular-nums font-quicksand tracking-tighter", layout === "horizontal" ? "text-4xl" : "text-3xl")}>{big}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{label}</span>
          </div>
          {narration && <p className="text-sm leading-snug mt-1 text-foreground/80 font-medium">{narration}</p>}
        </div>
      </div>
    </Card>
  );
}
