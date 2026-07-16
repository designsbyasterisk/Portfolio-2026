import { Map, AlertTriangle, X } from "lucide-react";

export default function CircuitSpecs({ viewMode, selectedIncident, setSelectedIncident, raceResults }: any) {
  if (viewMode === "incidents" && selectedIncident) {
    return (
      <div className="flex flex-col h-full animate-fade-in text-[#121212]">
        <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#e8002d] animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Incident File</span>
          </div>
          <button 
            onClick={() => setSelectedIncident(null)}
            className="p-1 hover:bg-black/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs font-medium flex-1 overflow-y-auto scrollbar-none pr-1">
          <div className="flex justify-between border-b border-black/5 py-1">
            <span className="text-black/60 uppercase text-[9px] tracking-wider font-bold">Type</span>
            <span className="font-bold uppercase tracking-wider text-[10px]">{selectedIncident.type.replace("_", " ")}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 py-1">
            <span className="text-black/60 uppercase text-[9px] tracking-wider font-bold">Turn</span>
            <span className="font-bold">{selectedIncident.turn}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 py-1">
            <span className="text-black/60 uppercase text-[9px] tracking-wider font-bold">Lap</span>
            <span className="font-bold mono">{selectedIncident.lap}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 py-1">
            <span className="text-black/60 uppercase text-[9px] tracking-wider font-bold">Drivers involved</span>
            <span className="font-bold">{selectedIncident.drivers.join(", ")}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 py-1">
            <span className="text-black/60 uppercase text-[9px] tracking-wider font-bold">Impact severity</span>
            <span className="font-bold text-[#e8002d] uppercase">{selectedIncident.severity}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 py-1">
            <span className="text-black/60 uppercase text-[9px] tracking-wider font-bold">Race impact</span>
            <span className="font-bold text-right max-w-[150px] leading-tight">{selectedIncident.raceImpact}</span>
          </div>
          
          <div className="mt-3">
            <div className="text-[9px] font-semibold text-black/50 uppercase tracking-widest mb-1.5">Details</div>
            <p className="text-[11px] leading-relaxed bg-black/5 p-2.5 rounded">
              {selectedIncident.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (raceResults?.circuit) {
    return (
      <div className="flex flex-col h-full text-[#121212]">
        <div className="uppercase tracking-[0.2em] font-semibold text-[12px] mb-2.5 text-black border-b border-black/10 pb-2 flex items-center gap-1.5 shrink-0">
          <Map className="w-3.5 h-3.5 text-primary" /> Circuit Specs
        </div>
        <div className="space-y-2 text-[11px] font-semibold flex-1 overflow-y-auto scrollbar-none pr-1">
          <div className="flex justify-between items-center">
            <span className="text-black/60 uppercase tracking-wider text-[9px]">Length</span>
            <span className="font-bold mono bg-black/5 px-2 py-0.5 rounded">{raceResults.circuit.length} km</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-black/60 uppercase tracking-wider text-[9px]">Turns</span>
            <span className="font-bold mono">{raceResults.circuit.turns}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-black/60 uppercase tracking-wider text-[9px]">DRS Zones</span>
            <span className="font-bold mono">{raceResults.circuit.drsZones}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-black/60 uppercase tracking-wider text-[9px]">Overtaking index</span>
            <span className="font-bold mono text-[#e8002d]">{raceResults.circuit.overtakingIndex}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-black/60 uppercase tracking-wider text-[9px]">Track Record</span>
            <span className="font-bold mono">{raceResults.circuit.lapRecord}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-black/60 uppercase tracking-wider text-[9px]">Record Holder</span>
            <span className="font-bold">{raceResults.circuit.lapRecordHolder}</span>
          </div>
          <div className="flex justify-between items-center border-t border-black/5 pt-2">
            <span className="text-black/60 uppercase tracking-wider text-[9px]">Circuit Type</span>
            <span className="font-bold text-right">Street Circuit</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-black/60 uppercase tracking-wider text-[9px]">First Grand Prix</span>
            <span className="font-bold mono">1950</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-black/60 uppercase tracking-wider text-[9px]">Race Distance</span>
            <span className="font-bold mono text-right">78 Laps (260.286 km)</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
