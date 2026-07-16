import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/lib/useAppState";
import { CompanionSprite } from "@/components/CompanionSprite";
import { useNavigate } from "react-router-dom";
import { seedWeekOfData } from "@/lib/seed";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { state, update, reset } = useAppState();
  const navigate = useNavigate();
  const a = state.assessment;
  const plan = state.plan;

  return (
    <div className="space-y-5 pt-2 animate-float-up stagger">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">You</h1>
      </div>

      <Card className="p-5 glass border-white/50 flex items-center gap-4">
        <CompanionSprite companion={state.companion} size={72} />
        <div>
          <p className="text-sm font-semibold">{state.companion.name}</p>
          <p className="text-xs text-muted-foreground capitalize">Stage: {state.companion.stage}</p>
          <p className="text-xs text-muted-foreground mt-1">{state.xp} XP earned</p>
        </div>
      </Card>

      {a && (
        <Card className="p-5 glass border-white/50 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your why</p>
          <p className="text-base italic leading-relaxed">"{a.whySentence}"</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {a.motivations.map((m) => (
              <Badge key={m} variant="secondary" className="bg-accent text-accent-foreground border-0 capitalize">{m}</Badge>
            ))}
          </div>
        </Card>
      )}

      {plan && (
        <Card className="p-5 glass border-white/50 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your plan</p>
          <p className="text-sm">
            <span className="font-semibold capitalize">{plan.dependenceLevel}</span> dependence · {plan.weeks}-week taper · started{" "}
            {new Date(plan.startDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">Fagerström score: {plan.fagerstromScore}/10</p>
        </Card>
      )}

      <Card className="p-5 glass border-white/50 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account</p>
        <p className="text-sm text-muted-foreground">
          Your data lives on this device. Cloud sync coming soon — back up your streak across devices.
        </p>
        <Button variant="outline" disabled className="w-full">Create account (coming soon)</Button>
      </Card>

      <Card className="p-5 glass border-white/50 space-y-3 hover-lift">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demo</p>
        <p className="text-sm text-muted-foreground">
          Want to see how Ember looks with a week of activity? Seed your log with realistic test data.
        </p>
        <Button
          variant="outline"
          className="w-full press-scale border-primary/30 text-primary hover:bg-accent"
          onClick={() => {
            update((s) => seedWeekOfData(s));
            toast.success("Seeded 7 days of test activity 🌱");
          }}
        >
          <Sparkles className="h-4 w-4 mr-2" /> Seed a week of test data
        </Button>
      </Card>

      <Card className="p-5 glass border-white/50 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reset</p>
        <Button
          variant="ghost"
          className="w-full text-destructive hover:text-destructive"
          onClick={() => {
            if (confirm("Erase all data and start over? This cannot be undone.")) {
              reset();
              navigate("/");
            }
          }}
        >
          Erase all data
        </Button>
      </Card>
    </div>
  );
}
