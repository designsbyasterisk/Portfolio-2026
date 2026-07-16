import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import type { Trigger } from "@/lib/types";

import { Zap, RefreshCw, Users, Coffee } from "lucide-react";

interface Props {
  open: boolean;
  onSelect: (trigger: Trigger) => void;
  onClose: () => void;
}

const OPTIONS: { id: Trigger; label: string; icon: React.ElementType }[] = [
  { id: "stress", label: "Stress", icon: Zap },
  { id: "habit", label: "Habit", icon: RefreshCw },
  { id: "social", label: "Social", icon: Users },
  { id: "boredom", label: "Boredom", icon: Coffee },
];

export function TriggerDialog({ open, onSelect, onClose }: Props) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal container={document.getElementById("mobile-overlay-root")}>
        <DialogPrimitive.Overlay className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 pointer-events-auto" />
        <DialogPrimitive.Content className="absolute left-[50%] top-[50%] z-50 grid w-[340px] translate-x-[-50%] translate-y-[-50%] rounded-[2rem] border-white/40 border p-6 glass shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 pointer-events-auto">
          <div className="text-center mb-6">
            <DialogPrimitive.Title className="text-2xl font-bold font-quicksand text-slate-900">What triggered this?</DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-slate-600 mt-2">
              Logging triggers helps you spot patterns over time.
            </DialogPrimitive.Description>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/40 bg-white/40 hover:bg-white/60 transition-all ease-out hover-lift text-slate-900"
              >
                <opt.icon className="h-8 w-8 mb-2 text-slate-700" strokeWidth={1.5} />
                <span className="font-semibold text-sm">{opt.label}</span>
              </button>
            ))}
          </div>

          <Button variant="ghost" className="w-full mt-4 text-slate-500 hover:text-slate-800" onClick={onClose}>
            Skip for now
          </Button>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
