import { useState, useEffect, useRef } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Map, 
  Maximize2, 
  SlidersHorizontal,
  Play,
  Pause,
  HelpCircle,
  Move,
  Lock
} from "lucide-react";

interface Step {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps: Step[] = [
    {
      title: "Explore 3D Viewport",
      icon: <Map className="w-10 h-10 text-primary" />,
      content: (
        <div className="space-y-3.5 text-xs text-white/80 leading-relaxed">
          <p>
            Interact with the high-fidelity 3D map of <strong className="text-white">Circuit de Monaco</strong>:
          </p>
          <ul className="space-y-2 list-disc list-inside pl-1 text-[11px]">
            <li><strong className="text-white">Left Click + Drag</strong> to rotate the camera around the track.</li>
            <li><strong className="text-white">Scroll Mouse Wheel</strong> to zoom in and out of the sectors.</li>
            <li><strong className="text-white">Right Click + Drag</strong> to pan the view.</li>
            <li>Use the sub-menu buttons at the top of the viewport to toggle views like <strong className="text-white">Spatial Zones</strong>, <strong className="text-white">Telemetry</strong>, or <strong className="text-white">Incidents</strong>.</li>
          </ul>
        </div>
      )
    },
    {
      title: "Customize Workspace",
      icon: <Maximize2 className="w-10 h-10 text-primary animate-pulse" />,
      content: (
        <div className="space-y-3.5 text-xs text-white/80 leading-relaxed">
          <p>
            Adapt the dashboard layout to your screen size:
          </p>
          <ul className="space-y-2 list-disc list-inside pl-1 text-[11px]">
            <li>
              <strong className="text-white">Drag & Reposition</strong>: Click and hold any card's header title to move it.
            </li>
            <li>
              <strong className="text-white">Resize Cards</strong>: Drag the bottom-right corner of a card to scale its dimensions.
            </li>
            <li>
              <strong className="text-white">Lock Grid Locks</strong>: Click the <Lock className="inline w-3 h-3 text-primary mx-0.5" /> lock button in the top corner of any card to freeze its position and disable drag-and-resize.
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "Widget Selector",
      icon: <SlidersHorizontal className="w-10 h-10 text-primary" />,
      content: (
        <div className="space-y-3.5 text-xs text-white/80 leading-relaxed">
          <p>
            Manage the visual load of your dashboard:
          </p>
          <ul className="space-y-2 list-disc list-inside pl-1 text-[11px]">
            <li>
              Click the <strong className="text-white uppercase tracking-wider text-[10px] bg-white/10 px-2 py-0.5 rounded">Widgets</strong> menu button in the top header.
            </li>
            <li>
              Toggle checkboxes to show or hide panels in the active layout.
            </li>
            <li>
              <strong className="text-white">Limits Enforced</strong>: To keep the F1 dashboard clean and properly fitted, you must display a <strong className="text-primary">minimum of 3</strong> and a <strong className="text-primary">maximum of 10</strong> widgets at once.
            </li>
          </ul>
        </div>
      )
    }
  ];

  // Reset step when overlay is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-[480px] bg-[#0c0c0f]/95 border border-white/10 rounded-[12px] p-6 sm:p-7 shadow-2xl overflow-hidden flex flex-col justify-between gap-6 min-h-[340px] mx-4 transition-all duration-300">
        
        {/* Glow Red Header Line */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30 shadow-[0_0_15px_rgba(232,0,45,0.7)]" />

        {/* Header Title & Close Button */}
        <div className="flex justify-between items-start shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.25em] text-white/60 uppercase">Onboarding Guide</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-white/5 rounded text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Section with icon and body */}
        <div className="flex-1 flex flex-col gap-4 justify-center py-2">
          <div className="flex items-center gap-4 border-b border-white/5 pb-3">
            <div className="p-2.5 bg-white/5 rounded-md border border-white/10 shrink-0">
              {steps[currentStep].icon}
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-[0.05em] text-white uppercase leading-tight font-sans">
                {steps[currentStep].title}
              </h3>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5 font-semibold">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-[140px] flex flex-col justify-center">
            {steps[currentStep].content}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4 shrink-0">
          {/* Skip button */}
          <button 
            onClick={handleSkip}
            className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider transition-colors"
          >
            Skip Tour
          </button>

          {/* Stepper controls */}
          <div className="flex items-center gap-2">
            <button
              disabled={currentStep === 0}
              onClick={handlePrev}
              className="p-1.5 bg-white/5 border border-white/10 hover:border-primary/60 rounded text-white disabled:opacity-30 disabled:hover:border-white/10 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1 shadow-md hover:shadow-primary/20 transition-all border border-primary/20"
            >
              <span>{currentStep === steps.length - 1 ? "Finish" : "Next"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
