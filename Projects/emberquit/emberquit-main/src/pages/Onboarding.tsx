import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CompanionSprite } from "@/components/CompanionSprite";
import { useAppState } from "@/lib/useAppState";
import { FAGERSTROM_QUESTIONS, buildPlan, dependenceLevelFromScore, scoreFagerstrom } from "@/lib/plan";
import type { Assessment, Motivation, Trigger } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Flame, Heart, Wallet, Activity, Wind, Sparkles, Baby, Compass } from "lucide-react";

const TRIGGERS: { id: Trigger; label: string; emoji: string }[] = [
  { id: "stress", label: "Stress", emoji: "😮‍💨" },
  { id: "coffee", label: "Coffee", emoji: "☕" },
  { id: "alcohol", label: "Alcohol", emoji: "🍷" },
  { id: "after_meals", label: "After meals", emoji: "🍽️" },
  { id: "driving", label: "Driving", emoji: "🚗" },
  { id: "social", label: "Social", emoji: "👥" },
  { id: "boredom", label: "Boredom", emoji: "🥱" },
  { id: "phone_breaks", label: "Phone breaks", emoji: "📱" },
  { id: "waking_up", label: "Waking up", emoji: "🌅" },
];

const MOTIVATIONS: { id: Motivation; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "health", label: "Health", icon: Heart },
  { id: "family", label: "Family", icon: Heart },
  { id: "money", label: "Money", icon: Wallet },
  { id: "fitness", label: "Fitness", icon: Activity },
  { id: "freedom", label: "Freedom", icon: Wind },
  { id: "smell", label: "Smell better", icon: Sparkles },
  { id: "pregnancy", label: "Pregnancy", icon: Baby },
  { id: "control", label: "Control", icon: Compass },
];

const STEPS = ["welcome", "basics", "fagerstrom", "triggers", "routine", "history", "motivation", "summary"] as const;
type Step = (typeof STEPS)[number];

const initial: Partial<Assessment> = {
  cigsPerPack: 20,
  fagerstrom: [],
  triggers: [],
  motivations: [],
  pastAttempts: 0,
  goalMode: "let_app_decide",
  whySentence: "",
  hardestTime: "morning",
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { update } = useAppState();
  const [stepIdx, setStepIdx] = useState(0);
  const [a, setA] = useState<Partial<Assessment>>(initial);
  const [fagIdx, setFagIdx] = useState(0);

  const step = STEPS[stepIdx];
  const progress = (stepIdx / (STEPS.length - 1)) * 100;

  const next = () => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  const back = () => setStepIdx((i) => Math.max(0, i - 1));

  const toggleArr = <T,>(key: keyof Assessment, value: T) => {
    setA((prev) => {
      const arr = ((prev[key] as unknown as T[]) ?? []).slice();
      const i = arr.indexOf(value);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(value);
      return { ...prev, [key]: arr } as Partial<Assessment>;
    });
  };

  const finish = () => {
    const assessment = a as Assessment;
    const plan = buildPlan(assessment);
    update((s) => ({
      ...s,
      assessment,
      plan,
      onboardedAt: Date.now(),
      companion: { ...s.companion, stage: "sprout", vitality: 70 },
    }));
    // Defer navigation so React can flush the state update (and persist to
    // localStorage) before the ProtectedShell route reads it.
    setTimeout(() => navigate("/home"), 0);
  };

  const canContinue = (): boolean => {
    switch (step) {
      case "welcome":
        return true;
      case "basics":
        return !!a.cigsPerDay && a.cigsPerDay > 0 && !!a.pricePerPack && a.pricePerPack > 0 && !!a.yearsSmoking;
      case "fagerstrom":
        return (a.fagerstrom?.length ?? 0) === FAGERSTROM_QUESTIONS.length;
      case "triggers":
        return (a.triggers?.length ?? 0) > 0;
      case "routine":
        return !!a.hardestTime;
      case "history":
        return a.pastAttempts != null;
      case "motivation":
        return (a.motivations?.length ?? 0) > 0 && (a.whySentence?.trim().length ?? 0) > 0;
      case "summary":
        return true;
    }
  };

  const isIframe = typeof window !== "undefined" && window.self !== window.top;

  const innerContent = (
    <>
      <div id="mobile-overlay-root" className="absolute inset-0 z-50 pointer-events-none"></div>
      <div className="absolute inset-0 noise-overlay opacity-30 pointer-events-none mix-blend-overlay"></div>
      <div className="relative z-10 flex-1 overflow-y-auto hide-scrollbar p-6">
          <div className="flex items-center gap-3 mb-4 mt-8">
          <Flame className="h-6 w-6 text-primary" />
          <span className="font-semibold tracking-tight">Ember</span>
        </div>
        <Progress value={progress} className="h-1.5 mb-8" />

        <Card className="p-7 shadow-card border-white/50 glass animate-float-up text-slate-900" key={step}>
          {step === "welcome" && <WelcomeStep onStart={next} />}

          {step === "basics" && (
            <div className="space-y-5">
              <Header title="A few basics" subtitle="No judgment — just numbers we'll use to personalize your plan." />
              <Field label="How many cigarettes per day, on average?">
                <Input type="number" min={1} value={a.cigsPerDay ?? ""} onChange={(e) => setA({ ...a, cigsPerDay: +e.target.value })} placeholder="e.g. 15" />
              </Field>
              <Field label="How many years have you been smoking?">
                <Input type="number" min={0} value={a.yearsSmoking ?? ""} onChange={(e) => setA({ ...a, yearsSmoking: +e.target.value })} placeholder="e.g. 8" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Price/pack (₹)" labelClass="text-xs">
                   <Input type="number" min={0} step="1" value={a.pricePerPack ?? ""} onChange={(e) => setA({ ...a, pricePerPack: +e.target.value })} placeholder="e.g. 350" className="h-10 text-sm" />
                </Field>
                <Field label="Cigs/pack" labelClass="text-xs">
                  <Input type="number" min={1} value={a.cigsPerPack ?? 20} onChange={(e) => setA({ ...a, cigsPerPack: +e.target.value })} className="h-10 text-sm" />
                </Field>
              </div>
            </div>
          )}

          {step === "fagerstrom" && (
            <div className="space-y-5">
              <Header title="Quick check-in" subtitle={`Question ${fagIdx + 1} of ${FAGERSTROM_QUESTIONS.length} — the Fagerström test, used by clinicians to tailor quit plans.`} />
              <p className="text-base font-medium leading-snug">{FAGERSTROM_QUESTIONS[fagIdx].q}</p>
              <div className="space-y-2">
                {FAGERSTROM_QUESTIONS[fagIdx].options.map((opt, i) => {
                  const selected = a.fagerstrom?.[fagIdx] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        const arr = (a.fagerstrom ?? []).slice();
                        arr[fagIdx] = i;
                        setA({ ...a, fagerstrom: arr });
                        if (fagIdx < FAGERSTROM_QUESTIONS.length - 1) setTimeout(() => setFagIdx(fagIdx + 1), 200);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border transition-all ease-warm",
                        selected ? "border-primary bg-accent shadow-glow" : "border-border hover:border-primary/40 hover:bg-muted/50",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pt-2">
                <button onClick={() => setFagIdx(Math.max(0, fagIdx - 1))} disabled={fagIdx === 0} className="disabled:opacity-30">← previous</button>
                <button onClick={() => setFagIdx(Math.min(FAGERSTROM_QUESTIONS.length - 1, fagIdx + 1))} disabled={fagIdx === FAGERSTROM_QUESTIONS.length - 1} className="disabled:opacity-30">next →</button>
              </div>
            </div>
          )}

          {step === "triggers" && (
            <div className="space-y-5">
              <Header title="What pulls you toward a cigarette?" subtitle="Pick all that apply. We'll coach you through these moments." />
              <div className="grid grid-cols-2 gap-2">
                {TRIGGERS.map((t) => {
                  const on = a.triggers?.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleArr<Trigger>("triggers", t.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-xl border text-left transition-all ease-warm",
                        on ? "border-primary bg-accent shadow-glow" : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <span className="font-medium text-sm">{t.label}</span>
                    </button>
                  );
                })}
              </div>
              <Field label="Anything else? (optional)">
                <Input value={a.triggerOther ?? ""} onChange={(e) => setA({ ...a, triggerOther: e.target.value })} placeholder="e.g. after arguments" />
              </Field>
            </div>
          )}

          {step === "routine" && (
            <div className="space-y-5">
              <Header title="When do cravings hit hardest?" subtitle="We'll lighten the schedule and surface support around that window." />
              <div className="grid grid-cols-2 gap-2">
                {(["morning", "afternoon", "evening", "night"] as const).map((t) => {
                  const on = a.hardestTime === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setA({ ...a, hardestTime: t })}
                      className={cn(
                        "px-4 py-4 rounded-xl border capitalize font-medium transition-all ease-warm",
                        on ? "border-primary bg-accent shadow-glow" : "border-border hover:border-primary/40",
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "history" && (
            <div className="space-y-5">
              <Header title="Have you tried to quit before?" subtitle="Past attempts are practice — they make this attempt more likely to stick." />
              <Field label="How many serious attempts?">
                <Input type="number" min={0} value={a.pastAttempts ?? 0} onChange={(e) => setA({ ...a, pastAttempts: +e.target.value })} />
              </Field>
              <Field label="What worked or didn't? (optional)">
                <Textarea value={a.pastAttemptsNote ?? ""} onChange={(e) => setA({ ...a, pastAttemptsNote: e.target.value })} placeholder="e.g. patches helped for 2 weeks, then stress at work…" rows={3} />
              </Field>
            </div>
          )}

          {step === "motivation" && (
            <div className="space-y-5">
              <Header title="What are you doing this for?" subtitle="Pick up to 3. Your reasons shape the encouragement we send." />
              <div className="grid grid-cols-2 gap-2">
                {MOTIVATIONS.map((m) => {
                  const on = a.motivations?.includes(m.id);
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (!on && (a.motivations?.length ?? 0) >= 3) return;
                        toggleArr<Motivation>("motivations", m.id);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-xl border text-left transition-all ease-warm",
                        on ? "border-primary bg-accent shadow-glow" : "border-border hover:border-primary/40",
                      )}
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{m.label}</span>
                    </button>
                  );
                })}
              </div>
              <Field label="In one sentence — why now?">
                <Textarea value={a.whySentence ?? ""} onChange={(e) => setA({ ...a, whySentence: e.target.value })} placeholder="So I can play with my kids without losing breath." rows={2} maxLength={200} />
              </Field>
            </div>
          )}

          {step === "summary" && <SummaryStep a={a as Assessment} onFinish={finish} />}
        </Card>

        {step !== "welcome" && step !== "summary" && (
          <div className="flex items-center justify-between mt-6">
            <Button variant="ghost" onClick={back}>Back</Button>
            <Button onClick={next} disabled={!canContinue()} className="bg-gradient-ember text-primary-foreground shadow-glow">
              Continue
            </Button>
          </div>
        )}
      </div>
    </>
  );

  if (isIframe) {
    return (
      <div className="relative w-full h-full bg-app-bg overflow-hidden flex flex-col">
        {innerContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 overflow-hidden">
      <div className="relative w-[393px] h-[852px] bg-app-bg rounded-[3rem] border-[12px] border-black shadow-[0_0_80px_rgba(42,107,204,0.15)] overflow-hidden shrink-0 flex flex-col transform">
        {innerContent}
      </div>
    </div>
  );
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-1.5">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function Field({ label, children, labelClass }: { label: string; children: React.ReactNode, labelClass?: string }) {
  return (
    <div className="space-y-1.5 flex flex-col justify-end">
      <Label className={cn("font-medium", labelClass || "text-sm")}>{label}</Label>
      {children}
    </div>
  );
}

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center space-y-6 py-4">
      <CompanionSprite companion={{ name: "Ember", stage: "sprout", vitality: 80 }} size={120} className="mx-auto" />
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Hi, I'm Ember.</h1>
        <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
          I'll help you smoke less, gradually. No shame, no cold-turkey pressure — just science, small wins, and a little story for every step.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground pt-2">
        <div><div className="font-semibold text-foreground">5–7 min</div>setup</div>
        <div><div className="font-semibold text-foreground">Personalized</div>plan</div>
        <div><div className="font-semibold text-foreground">No account</div>needed</div>
      </div>
      <Button onClick={onStart} size="lg" className="w-full bg-gradient-ember text-primary-foreground shadow-glow">
        Let's begin
      </Button>
    </div>
  );
}

function SummaryStep({ a, onFinish }: { a: Assessment; onFinish: () => void }) {
  const score = scoreFagerstrom(a.fagerstrom);
  const level = dependenceLevelFromScore(score);
  const weeks = level === "high" ? 14 : level === "medium" ? 10 : 6;
  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <Badge variant="secondary" className="bg-accent text-accent-foreground border-0">Your plan is ready</Badge>
        <h1 className="text-2xl font-semibold tracking-tight">A {weeks}-week gentle taper</h1>
        <p className="text-sm text-muted-foreground">
          Based on a {level} dependence score and your top triggers, we'll step you down from{" "}
          <span className="font-semibold text-foreground">{a.cigsPerDay}/day</span> to{" "}
          <span className="font-semibold text-foreground">0</span> over {weeks} weeks — adjusting as we learn.
        </p>
      </div>
      <div className="rounded-xl bg-gradient-warm border border-border/60 p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your why</p>
        <p className="text-base italic">"{a.whySentence}"</p>
      </div>
      <ul className="space-y-2 text-sm">
        <li className="flex items-start gap-2"><span className="text-primary mt-0.5">●</span> Daily cap that gently steps down as your brain adjusts.</li>
        <li className="flex items-start gap-2"><span className="text-primary mt-0.5">●</span> CBT-based coaching when {a.triggers.slice(0, 2).join(" or ").replace(/_/g, " ")} hits.</li>
        <li className="flex items-start gap-2"><span className="text-primary mt-0.5">●</span> Real-world stories instead of cold numbers.</li>
      </ul>
      <Button onClick={onFinish} size="lg" className="w-full bg-gradient-ember text-primary-foreground shadow-glow">
        Start my journey
      </Button>
    </div>
  );
}
