import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/useAppState";
import { summarize } from "@/lib/analytics";
import { TEMPLATES } from "@/lib/narrator";
import { HEALTH_MILESTONES } from "@/lib/narrator/constants";
import { Wind, Heart, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Toolkit() {
  const { state } = useAppState();
  const summary = useMemo(() => summarize(state), [state]);
  const [breathing, setBreathing] = useState(false);

  // Story library: render every template that produces text right now
  const stories = useMemo(() => {
    return TEMPLATES.flatMap((t) => {
      const out = t.render({ state, summary, surface: t.surfaces[0] });
      return out ? [{ id: t.id, text: out.text, category: t.category }] : [];
    });
  }, [state, summary]);

  return (
    <div className="space-y-5 pt-2 animate-float-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Toolkit</h1>
        <p className="text-sm text-muted-foreground">Things that help when the urge knocks.</p>
      </div>

      <Card className="p-5 glass border-white/50">
        <div className="flex items-center gap-2 mb-2">
          <Wind className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Box breathing</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">In 4 · hold 4 · out 4 · hold 4. Calms the nervous system in under a minute.</p>
        <Button onClick={() => setBreathing((b) => !b)} variant="outline" className="w-full">
          {breathing ? "Stop" : "Start"}
        </Button>
        {breathing && <BreathingDot />}
      </Card>

      <Card className="p-5 glass border-white/50">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Health timeline</p>
        </div>
        <ol className="space-y-2.5">
          {HEALTH_MILESTONES.map((m) => {
            const reached = summary.streakDays * 24 >= m.hours;
            return (
              <li key={m.title} className="flex gap-3">
                <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", reached ? "bg-sage shadow-glow" : "bg-muted")} />
                <div>
                  <p className={cn("text-sm font-medium", reached && "text-sage-foreground")}>{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card className="p-5 glass border-white/50">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Your story library</p>
        </div>
        {stories.length === 0 ? (
          <p className="text-xs text-muted-foreground">Log a few days to unlock personalized stories.</p>
        ) : (
          <div className="space-y-2">
            {stories.map((s) => (
              <div key={s.id} className="text-sm leading-relaxed border-l-2 border-primary/40 pl-3 py-1">
                {s.text}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function BreathingDot() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const labels = ["Inhale...", "Hold...", "Exhale...", "Hold..."];

  return (
    <div className="mt-8 mb-4 flex flex-col items-center justify-center gap-2 py-6 relative h-48">
      <div className="absolute w-24 h-24 rounded-full bg-primary/40 filter blur-xl animate-box-breathe pointer-events-none"></div>
      <div className="relative z-10 w-28 h-28 rounded-full glass flex items-center justify-center shadow-glow">
         <span className="text-sm font-semibold font-quicksand text-foreground transition-opacity duration-500">{labels[phase]}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-8">Match your breath to the glow.</p>
    </div>
  );
}
