import { create } from 'zustand';

const useF1Store = create((set) => ({
  selectedTrack: 'monaco',
  selectedRace: 'monaco_2024',
  selectedDriver: 'Leclerc',
  comparisonDriver: null,
  viewMode: 'spatial',
  telemetryOpacity: 80,
  telemetryData: null,
  comparisonData: null,
  raceResults: null,
  incidentMarkers: [],
  isLeftOpen: true,
  isRightOpen: true,

  setSelectedDriver: (d) => set({ selectedDriver: d }),
  setComparisonDriver: (d) => set({ comparisonDriver: d }),
  setViewMode: (m) => set({ viewMode: m }),
  setTelemetryOpacity: (o) => set({ telemetryOpacity: o }),
  setTelemetryData: (d) => set({ telemetryData: d }),
  setComparisonData: (d) => set({ comparisonData: d }),
  setRaceResults: (r) => set({ raceResults: r }),
  setIncidentMarkers: (i) => set({ incidentMarkers: i }),
  setIsLeftOpen: (v) => set({ isLeftOpen: v }),
  setIsRightOpen: (v) => set({ isRightOpen: v }),
}));

export default useF1Store;
