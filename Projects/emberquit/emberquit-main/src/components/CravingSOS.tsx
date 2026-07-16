import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wind, Droplet, Footprints, Brain, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onBeat: () => void;
  onSmoked: () => void;
}

const STAGES = ["pick", "surf", "beat"] as const;

const TIPS = [
  { icon: Wind, title: "Box breathe", body: "In 4 · hold 4 · out 4 · hold 4. Repeat." },
  { icon: Droplet, title: "Drink water", body: "Cold sip. Hold it on your tongue." },
  { icon: Footprints, title: "Walk 60 seconds", body: "Move the body, the urge moves with it." },
  { icon: Brain, title: "Name it", body: "Say out loud: 'this is a wave, it will pass.'" },
];

const SURF_SECONDS = 240; // 4 min — typical craving peak

export function CravingSOS({ open, onClose, onBeat, onSmoked }: Props) {
  const [stage, setStage] = useState<(typeof STAGES)[number]>("pick");
  const [seconds, setSeconds] = useState(SURF_SECONDS);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStage("pick");
        setSeconds(SURF_SECONDS);
      }, 200);
    }
  }, [open]);

  useEffect(() => {
    if (stage !== "surf") return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [stage]);



  const pct = ((SURF_SECONDS - seconds) / SURF_SECONDS) * 100;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent 
        className="rounded-[2rem] border-border/60 p-0 overflow-hidden flex flex-col gap-0"
        style={{ left: '16px', right: '16px', top: '148px', bottom: '148px', transform: 'none' }}
      >
        <div className="bg-gradient-ember px-4 py-3 text-primary-foreground">
          <DialogTitle className="font-bold" style={{ fontSize: '15px', lineHeight: '1.2' }}>
            You're stronger than this wave
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80 mt-0.5" style={{ fontSize: '10px', lineHeight: '1.3' }}>
            Cravings peak in ~4 minutes, then fade. Pick a tool — let's ride it.
          </DialogDescription>
        </div>

        <div className="px-4 py-3 flex-1 flex flex-col justify-center space-y-2.5">
          {stage === "pick" && (
            <div className="grid grid-cols-2 gap-1.5">
              {TIPS.map((t) => (
                <button
                  key={t.title}
                  onClick={() => setStage("surf")}
                  className="text-left rounded-xl border border-border hover:border-primary/40 hover:bg-accent transition-all ease-warm"
                  style={{ padding: '8px 10px' }}
                >
                  <t.icon className="h-4 w-4 text-primary mb-1" />
                  <div className="font-semibold leading-tight" style={{ fontSize: '11px' }}>{t.title}</div>
                  <div className="text-muted-foreground mt-0.5" style={{ fontSize: '9px', lineHeight: '1.25' }}>{t.body}</div>
                </button>
              ))}
            </div>
          )}

          {stage === "surf" && (
            <div className="text-center space-y-2 py-1">
              <div className="relative inline-flex items-center justify-center w-24 h-24">
                <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90 w-full h-full">
                  <circle cx="50" cy="50" r="44" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
                  <circle
                    cx="50" cy="50" r="44" stroke="hsl(var(--primary))" strokeWidth="6" fill="none"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={2 * Math.PI * 44 * (1 - pct / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="font-semibold tabular-nums" style={{ fontSize: '20px' }}>
                  {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
                </div>
              </div>
              <p className="text-muted-foreground max-w-xs mx-auto" style={{ fontSize: '10px', lineHeight: '1.3' }}>
                Breathe slowly. Notice the urge as a wave — rising, peaking, fading. You don't have to do anything.
              </p>
              {seconds === 0 && (
                <p className="text-sage font-medium animate-float-up" style={{ fontSize: '11px' }}>The wave passed. How do you feel?</p>
              )}
            </div>
          )}

          {stage === "beat" && (
            <div className="text-center space-y-1.5 py-3">
              <div className="text-3xl">🌿</div>
              <p className="font-medium" style={{ fontSize: '12px' }}>You out-waited it. That's the brain rewiring.</p>
            </div>
          )}
        </div>

        <div className="border-t border-border p-2 flex gap-2">
          {stage !== "beat" ? (
            <>
              <Button variant="ghost" className="flex-1" style={{ height: '32px', fontSize: '11px' }} onClick={() => { onSmoked(); onClose(); }}>
                I smoked
              </Button>
              <Button className="flex-1 bg-gradient-ember text-primary-foreground" style={{ height: '32px', fontSize: '11px' }} onClick={() => { onBeat(); setStage("beat"); }}>
                I beat it
              </Button>
            </>
          ) : (
            <Button className="flex-grow" variant="outline" style={{ height: '32px', fontSize: '11px' }} onClick={onClose}>
              Close <X className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function classes() { return cn(); } // keep cn import alive in case
