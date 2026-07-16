import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAppState } from "@/lib/useAppState";
import { cigsOnDay, cravingsBeatenOnDay, startOfDay } from "@/lib/analytics";
import { dayIndex, todayCap } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { Cigarette, Wind, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAYS_BACK = 35;

export default function Log() {
  const { state } = useAppState();
  const plan = state.plan;
  const today = useMemo(() => startOfDay(), []);
  const [selectedTs, setSelectedTs] = useState<number>(today.getTime());

  if (!plan) {
    return <Card className="p-6 mt-4">Set up your plan first.</Card>;
  }

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const cells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const arr = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      arr.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      const cigs = cigsOnDay(state.cigarettes, day);
      const beats = cravingsBeatenOnDay(state.cravings, day);
      const cap = plan ? plan.schedule[Math.min(dayIndex(plan, day), plan.schedule.length - 1)] : 0;
      const planStart = plan ? startOfDay(new Date(plan.startDate)) : new Date();
      const beforePlan = day < planStart;
      const hasLogs = cigs > 0 || beats > 0;
      const isFuture = startOfDay(day).getTime() > startOfDay(new Date()).getTime();
      arr.push({ day, cigs, cap, beforePlan, hasLogs, isFuture });
    }
    return arr;
  }, [currentMonth, state.cigarettes, state.cravings, plan]);

  const prevMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const selectedDay = new Date(selectedTs);
  const selDayStart = startOfDay(selectedDay).getTime();
  const selDayEnd = selDayStart + 86400000;
  const selCigs = state.cigarettes.filter((e) => e.ts >= selDayStart && e.ts < selDayEnd);
  const selCravings = state.cravings.filter((e) => e.ts >= selDayStart && e.ts < selDayEnd);
  const selCap = plan.schedule[Math.min(dayIndex(plan, selectedDay), plan.schedule.length - 1)];
  const selBeats = selCravings.filter((c) => c.outcome === "beat").length;

  // Trigger breakdown for selected day
  const selTriggers = selCigs.reduce<Record<string, number>>((acc, e) => {
    const k = e.trigger ?? "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5 pt-2 animate-float-up stagger">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your log</h1>
        <p className="text-sm text-muted-foreground">Tap any day to see the story behind it.</p>
      </div>

      <Card className="p-5 glass border-white/50">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-black/5">
            <ChevronLeft className="h-5 w-5 text-slate-700" />
          </Button>
          <span className="font-semibold text-sm">
            {currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-black/5">
            <ChevronRight className="h-5 w-5 text-slate-700" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-muted-foreground">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }
            const { day, cigs, cap, beforePlan, hasLogs, isFuture } = cell;
            const ratio = beforePlan ? -1 : cap === 0 ? (cigs === 0 ? 0 : 2) : cigs / Math.max(1, cap);
            const cls = (isFuture || !hasLogs)
              ? ""
              : beforePlan
              ? "bg-muted/40"
              : ratio === 0
              ? "bg-sage shadow-glow text-white"
              : ratio <= 0.5
              ? "bg-sage/70 text-white"
              : ratio <= 1
              ? "bg-sage/40"
              : "bg-destructive/50 text-white";
            const isSelected = startOfDay(day).getTime() === startOfDay(selectedDay).getTime();
            const isToday = startOfDay(day).getTime() === today.getTime();
            return (
              <button
                key={day.toISOString()}
                title={`${day.toDateString()} — ${cigs} of ${cap}`}
                onClick={() => setSelectedTs(day.getTime())}
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all duration-200 press-scale hover:ring-2 hover:ring-primary/40 hover:z-10 relative",
                  cls,
                  !ratio && !beforePlan && !isSelected && "text-foreground/80",
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110 z-10 font-bold",
                  isToday && !isSelected && "ring-1 ring-slate-400",
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-sage" /> well under</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-sage/40" /> at cap</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive/50" /> over</span>
        </div>
      </Card>

      {/* Selected day detail */}
      <Card key={selectedTs} className="p-5 glass border-white/50 animate-scale-in">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {selDayStart === today.getTime() ? "Today" : selectedDay.toLocaleDateString(undefined, { weekday: "long" })}
            </p>
            <p className="text-base font-semibold">
              {selectedDay.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums">
              {selCigs.length}
              <span className="text-sm text-muted-foreground font-normal"> / {selCap}</span>
            </p>
            <p className="text-[10px] text-muted-foreground">cigarettes / cap</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-accent p-3 hover-lift">
            <Cigarette className="h-4 w-4 text-primary mb-1" />
            <p className="text-lg font-semibold tabular-nums">{selCigs.length}</p>
            <p className="text-[10px] text-muted-foreground">smoked</p>
          </div>
          <div className="rounded-xl bg-sage-soft p-3 hover-lift">
            <Wind className="h-4 w-4 text-sage mb-1" />
            <p className="text-lg font-semibold tabular-nums">{selBeats}</p>
            <p className="text-[10px] text-muted-foreground">cravings beaten</p>
          </div>
        </div>

        {Object.keys(selTriggers).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Triggers that day</p>
            {Object.entries(selTriggers)
              .sort((a, b) => b[1] - a[1])
              .map(([k, n]) => (
                <div key={k} className="flex items-center justify-between text-sm animate-fade-in">
                  <span className="capitalize">{k.replace(/_/g, " ")}</span>
                  <span className="tabular-nums text-muted-foreground">{n}</span>
                </div>
              ))}
          </div>
        )}

        {selCigs.length === 0 && selBeats === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-sage" />
            Nothing logged this day — quiet wins count too.
          </div>
        )}

        {selCigs.length === 0 && selBeats > 0 && (
          <div className="flex items-center gap-2 text-sm text-sage-foreground">
            <Sparkles className="h-4 w-4" />
            Smoke-free day. {selBeats} craving{selBeats > 1 ? "s" : ""} beaten — pure willpower.
          </div>
        )}
      </Card>

      <Card className="p-5 glass border-white/50 hover-lift">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today</p>
        <p className="mt-1 text-base">
          <span className="font-semibold tabular-nums">{cigsOnDay(state.cigarettes, today)}</span>{" "}
          / {todayCap(plan)} cigarettes
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          You've logged {state.cravings.filter((c) => c.outcome === "beat").length} cravings beaten across your journey.
        </p>
      </Card>
    </div>
  );
}
