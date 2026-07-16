import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppState } from "@/lib/useAppState";
import { cigsOnDay, cravingsBeatenOnDay, hourHistogram, startOfDay, summarize, triggerHistogram } from "@/lib/analytics";
import { dayIndex } from "@/lib/plan";
import { selectNarration } from "@/lib/narrator";
import { buildSuggestions } from "@/lib/suggestions";
import { TrendingDown, TrendingUp, Minus, Cigarette, Wind, Wallet, Sparkles } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DAY_MS = 86400000;

export default function Insights() {
  const { state } = useAppState();
  const summary = useMemo(() => summarize(state), [state]);
  const hours = useMemo(() => hourHistogram(state.cigarettes), [state.cigarettes]);
  const triggers = useMemo(() => triggerHistogram(state.cigarettes), [state.cigarettes]);

  const peakHour = hours.indexOf(Math.max(...hours));
  const peakHourPct = state.cigarettes.length ? Math.round((hours[peakHour] / state.cigarettes.length) * 100) : 0;

  const insightNarr = useMemo(
    () => selectNarration({ state, summary, surface: "insight" }),
    [state, summary],
  );

  const suggestions = useMemo(() => buildSuggestions(state, summary), [state, summary]);

  const max = Math.max(1, ...hours);

  const topTriggers = Object.entries(triggers)
    .filter(([k]) => k !== "unknown")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Daily triggers
  const todayCigs = state.cigarettes.filter((c) => c.ts >= startOfDay().getTime());
  const topTodayTriggers = Object.entries(triggerHistogram(todayCigs))
    .filter(([k]) => k !== "unknown")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Weekly triggers (last 7 days including today)
  const thisWeekStart = startOfDay(new Date(Date.now() - 6 * DAY_MS)).getTime();
  const thisWeekCigs = state.cigarettes.filter((c) => c.ts >= thisWeekStart);
  const topWeekTriggers = Object.entries(triggerHistogram(thisWeekCigs))
    .filter(([k]) => k !== "unknown")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // ===== Daily (last 7 days) =====
  const today = startOfDay();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today.getTime() - (6 - i) * DAY_MS);
    return {
      day,
      label: day.toLocaleDateString(undefined, { weekday: "short" }),
      cigs: cigsOnDay(state.cigarettes, day),
      beats: cravingsBeatenOnDay(state.cravings, day),
      cap: state.plan ? state.plan.schedule[Math.min(dayIndex(state.plan, day), state.plan.schedule.length - 1)] : 0,
    };
  });
  const last7Max = Math.max(1, ...last7.map((d) => Math.max(d.cigs, d.cap)));

  const dailyAvg = last7.reduce((a, d) => a + d.cigs, 0) / 7;
  const yest = last7[5];
  const todayD = last7[6];
  const dayDelta = todayD.cigs - yest.cigs;

  // ===== Weekly (last 4 weeks) =====
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date(today.getTime() - (3 - i) * 7 * DAY_MS - 6 * DAY_MS);
    let cigs = 0;
    let beats = 0;
    let underCapDays = 0;
    let totalCap = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart.getTime() + d * DAY_MS);
      const c = cigsOnDay(state.cigarettes, day);
      const b = cravingsBeatenOnDay(state.cravings, day);
      const cap = state.plan ? state.plan.schedule[Math.min(dayIndex(state.plan, day), state.plan.schedule.length - 1)] : 0;
      cigs += c;
      beats += b;
      totalCap += cap;
      if (c <= cap) underCapDays++;
    }
    return {
      label: i === 3 ? "This wk" : i === 2 ? "Last wk" : `${4 - i}w ago`,
      cigs,
      beats,
      underCapDays,
      cap: totalCap,
    };
  });
  const weekMax = Math.max(1, ...weeks.map((w) => Math.max(w.cigs, w.cap)));
  const thisWeek = weeks[3];
  const lastWeek = weeks[2];
  const weekDelta = thisWeek.cigs - lastWeek.cigs;
  const weekMoneySaved = state.assessment
    ? ((state.assessment.cigsPerDay * 7 - thisWeek.cigs) / state.assessment.cigsPerPack) * state.assessment.pricePerPack
    : 0;

  return (
    <div className="space-y-5 pt-2 animate-float-up stagger">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Patterns</h1>
        <p className="text-sm text-muted-foreground">What your data is whispering.</p>
      </div>

      <Card className="p-5 glass border-white/50 glass border-0 hover-lift">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wide">Story behind the numbers</span>
        </div>
        <p className="text-base font-medium leading-relaxed">
          {insightNarr?.text ?? "Log a few more days and we'll spot patterns worth telling."}
        </p>
      </Card>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily" className="press-scale">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="press-scale">Weekly</TabsTrigger>
        </TabsList>

        {/* ===== DAILY ===== */}
        <TabsContent value="daily" className="space-y-4 mt-4">
          <Card className="p-5 glass border-white/50 hover-lift animate-fade-in">
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last 7 days</p>
              <DeltaPill delta={dayDelta} unit="vs yesterday" inverse />
            </div>
            <p className="text-2xl font-semibold tabular-nums">
              {dailyAvg.toFixed(1)}
              <span className="text-sm text-muted-foreground font-normal"> avg / day</span>
            </p>

            <div className="mt-5 flex items-stretch gap-2 h-32">
              {last7.map((d, i) => {
                const cigsH = (d.cigs / last7Max) * 100;
                const capH = (d.cap / last7Max) * 100;
                const isToday = i === 6;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex-1 flex items-end relative">
                      {/* Cap line */}
                      <div
                        className="absolute left-0 right-0 border-t-2 border-dashed border-sage/60"
                        style={{ bottom: `${capH}%` }}
                        title={`cap ${d.cap}`}
                      />
                      {/* Bar */}
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                          d.cigs > d.cap ? "bg-destructive/70" : "bg-gradient-ember"
                        } ${isToday ? "shadow-glow" : ""}`}
                        style={{ height: `${cigsH}%`, animationDelay: `${i * 60}ms` }}
                        title={`${d.cigs} cigs`}
                      />
                    </div>
                    <span className={`text-[10px] ${isToday ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                      {d.label}
                    </span>
                    <span className="text-[10px] tabular-nums text-foreground/70">{d.cigs}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-gradient-ember" /> smoked</span>
              <span className="flex items-center gap-1"><span className="w-3 border-t-2 border-dashed border-sage/60" /> daily cap</span>
            </div>
          </Card>

          <Card className="p-5 glass border-white/50 hover-lift animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Daily trend</p>
            <p className="text-sm text-muted-foreground mb-3">Your line vs. your daily cap.</p>
            <div className="h-44 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cigsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={28} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="cap" name="Cap" stroke="hsl(var(--sage))" strokeDasharray="4 4" strokeWidth={2} fill="transparent" dot={false} />
                  <Area type="monotone" dataKey="cigs" name="Smoked" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#cigsFill)" dot={{ r: 3, fill: "hsl(var(--primary))" }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <MiniStat
              icon={<Cigarette className="h-4 w-4" />}
              big={`${todayD.cigs}`}
              label="today"
              sub={`cap ${todayD.cap}`}
              tone={todayD.cigs <= todayD.cap ? "good" : "warn"}
            />
            <MiniStat
              icon={<Wind className="h-4 w-4" />}
              big={`${todayD.beats}`}
              label="cravings beaten"
              sub="today"
              tone="sage"
            />
          </div>

          <Card className="p-5 glass border-white/50 hover-lift">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">When you smoke</p>
            {state.cigarettes.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">No cigarettes logged yet — nothing to chart.</p>
            ) : (
              <>
                <p className="text-base mt-1">
                  Peak hour: <span className="font-semibold">{peakHour}:00</span> —{" "}
                  <span className="font-semibold">{peakHourPct}%</span> of cigarettes.
                </p>
                <div className="mt-4 flex items-stretch gap-0.5 h-24">
                  {hours.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                      <div
                        className="w-full rounded-t bg-gradient-ember opacity-80 transition-all duration-700"
                        style={{ height: `${(h / max) * 100}%` }}
                        title={`${i}:00 — ${h}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>0</span><span>6</span><span>12</span><span>18</span><span>23</span>
                </div>
              </>
            )}
          </Card>
          <TriggerList title="Today's triggers" triggersMap={topTodayTriggers} totalCigs={todayCigs.length} />
        </TabsContent>

        {/* ===== WEEKLY ===== */}
        <TabsContent value="weekly" className="space-y-4 mt-4">
          <Card className="p-5 glass border-white/50 hover-lift animate-fade-in">
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last 4 weeks</p>
              <DeltaPill delta={weekDelta} unit="vs last week" inverse />
            </div>
            <p className="text-2xl font-semibold tabular-nums">
              {thisWeek.cigs}
              <span className="text-sm text-muted-foreground font-normal"> this week</span>
            </p>

            <div className="mt-5 flex items-stretch gap-3 h-32">
              {weeks.map((w, i) => {
                const cigsH = (w.cigs / weekMax) * 100;
                const capH = (w.cap / weekMax) * 100;
                const isCurrent = i === 3;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex-1 flex items-end relative">
                      <div
                        className="absolute left-0 right-0 border-t-2 border-dashed border-sage/60"
                        style={{ bottom: `${capH}%` }}
                      />
                      <div
                        className={`w-full rounded-t-md transition-all duration-700 ${
                          w.cigs > w.cap ? "bg-destructive/70" : "bg-gradient-ember"
                        } ${isCurrent ? "shadow-glow" : ""}`}
                        style={{ height: `${cigsH}%` }}
                      />
                    </div>
                    <span className={`text-[10px] ${isCurrent ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                      {w.label}
                    </span>
                    <span className="text-[10px] tabular-nums text-foreground/70">{w.cigs}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 glass border-white/50 hover-lift animate-fade-in">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Weekly trajectory</p>
            <p className="text-sm text-muted-foreground mb-3">Total cigarettes per week vs. weekly cap.</p>
            <div className="h-44 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeks} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={28} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="cap" name="Cap" stroke="hsl(var(--sage))" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="cigs" name="Smoked" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <MiniStat
              icon={<TrendingDown className="h-4 w-4" />}
              big={`${thisWeek.underCapDays}/7`}
              label="days under cap"
              sub="this week"
              tone={thisWeek.underCapDays >= 5 ? "good" : "sage"}
            />

            <MiniStat
              icon={<Wind className="h-4 w-4" />}
              big={`${thisWeek.beats}`}
              label="cravings beaten"
              sub="this week"
              tone="sage"
            />
            <MiniStat
              icon={<Wallet className="h-4 w-4" />}
              big={`${state.profile.currency}${weekMoneySaved.toFixed(weekMoneySaved < 10 ? 2 : 0)}`}
              label="saved"
              sub="this week"
              tone="good"
            />
            <MiniStat
              icon={<Cigarette className="h-4 w-4" />}
              big={`${(thisWeek.cigs / 7).toFixed(1)}`}
              label="avg / day"
              sub="this week"
              tone={thisWeek.cigs / 7 <= (thisWeek.cap / 7) ? "good" : "warn"}
            />
          </div>
          <TriggerList title="This week's triggers" triggersMap={topWeekTriggers} totalCigs={thisWeekCigs.length} />
        </TabsContent>
      </Tabs>

      <TriggerList title="Top triggers (all time)" triggersMap={topTriggers} totalCigs={state.cigarettes.length} />

      <Card className="p-5 shadow-card border-0 glass hover-lift animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wide">Personalised for you</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Suggestions tuned to your patterns — not generic tips.
        </p>
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div
              key={s.id}
              className="rounded-xl bg-background/70 backdrop-blur-sm border border-border/50 p-4 animate-fade-in hover-lift"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl leading-none">{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TriggerList({ title, triggersMap, totalCigs }: { title: string, triggersMap: [string, number][], totalCigs: number }) {
  if (triggersMap.length === 0) return null;
  return (
    <Card className="p-5 glass border-white/50 hover-lift">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">{title}</p>
      <div className="space-y-2">
        {triggersMap.map(([k, n]) => {
          const pct = Math.round((n / totalCigs) * 100);
          return (
            <div key={k} className="animate-fade-in">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize font-medium">{k.replace(/_/g, " ")}</span>
                <span className="text-muted-foreground tabular-nums">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-ember transition-all duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DeltaPill({ delta, unit, inverse = false }: { delta: number; unit: string; inverse?: boolean }) {
  // inverse=true means lower is better (cigarettes)
  const isGood = inverse ? delta < 0 : delta > 0;
  const isFlat = delta === 0;
  const Icon = isFlat ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const color = isFlat
    ? "bg-muted text-muted-foreground"
    : isGood
    ? "bg-sage-soft text-sage-foreground"
    : "bg-destructive/15 text-destructive";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${color}`}>
      <Icon className="h-3 w-3" />
      {delta > 0 ? "+" : ""}{delta} {unit}
    </span>
  );
}

function MiniStat({
  icon, big, label, sub, tone,
}: {
  icon: React.ReactNode; big: string; label: string; sub?: string; tone: "good" | "warn" | "sage";
}) {
  const tint =
    tone === "good" ? "bg-accent text-primary"
    : tone === "warn" ? "bg-destructive/10 text-destructive"
    : "bg-sage-soft text-sage-foreground";
  return (
    <Card className="p-4 glass border-white/50 hover-lift">
      <div className={`inline-flex h-8 w-8 rounded-lg items-center justify-center ${tint}`}>{icon}</div>
      <p className="text-xl font-semibold tabular-nums mt-2">{big}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
    </Card>
  );
}
