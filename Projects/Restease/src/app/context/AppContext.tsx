import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { units as initialUnits, sosAlerts as initialAlerts, type Unit, type SOSAlert } from "../data/mockData";
import { darkTheme, lightTheme, type ThemeTokens } from "../styles/themes";

interface AppContextValue {
  units: Unit[];
  alerts: SOSAlert[];
  hasActiveSOS: boolean;
  missionTime: string;
  isOffline: boolean;
  acknowledgeAlert: (id: string) => void;
  respondToAlert: (id: string) => void;
  dispatchUnit: (alertId: string, unitId: string) => void;
  simulateSOS: () => void;
  theme: ThemeTokens;
  toggleTheme: () => void;
  rainRate: number;
  landslideRisk: "LOW" | "MODERATE" | "HIGH" | "SEVERE";
}

const AppContext = createContext<AppContextValue>({
  units: [],
  alerts: [],
  hasActiveSOS: false,
  missionTime: "00:00:00",
  isOffline: false,
  acknowledgeAlert: () => {},
  respondToAlert: () => {},
  dispatchUnit: () => {},
  simulateSOS: () => {},
  theme: darkTheme,
  toggleTheme: () => {},
  rainRate: 45,
  landslideRisk: "MODERATE",
});

function formatTime(d: Date) {
  return d.toTimeString().slice(0, 8) + " IST";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [alerts, setAlerts] = useState<SOSAlert[]>(initialAlerts);
  const [missionTime, setMissionTime] = useState(formatTime(new Date()));
  const [isOffline, setIsOffline] = useState(false);
  const [rainRate, setRainRate] = useState(45);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isLight, setIsLight] = useState(false);
  const theme = isLight ? lightTheme : darkTheme;

  const toggleTheme = () => setIsLight((v) => !v);

  const getLandslideRisk = (rate: number) => {
    if (rate < 50) return "MODERATE";
    if (rate < 75) return "HIGH";
    return "SEVERE";
  };


  // Dynamic Simulation for Movement & Offline
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setMissionTime(formatTime(new Date()));

      // Simulate offline drop every 30-40 seconds for 5 seconds
      const seconds = new Date().getSeconds();
      if (seconds % 40 > 35) {
        setIsOffline(true);
      } else {
        setIsOffline(false);
      }

      // Simulate monsoon rain fluctuations
      setRainRate((prev) => {
        let next = prev + (Math.random() * 4 - 2);
        if (next < 30) next = 30;
        if (next > 95) next = 95;
        return Math.round(next);
      });

      // Update unit movements
      setUnits((prev) => prev.map((unit) => {
        // Check if unit is dispatched to an active alert
        setAlerts((currentAlerts) => {
          const activeDispatchAlert = currentAlerts.find(a => !a.responded && a.dispatchedUnitId === unit.id);
          if (activeDispatchAlert) {
            // Find target unit's location
            const targetUnit = prev.find(u => u.id === activeDispatchAlert.unitId);
            if (targetUnit) {
              const dLat = targetUnit.lat - unit.lat;
              const dLng = targetUnit.lng - unit.lng;
              const dist = Math.sqrt(dLat * dLat + dLng * dLng);
              if (dist > 0.0002) {
                const step = 0.0003;
                unit = {
                  ...unit,
                  status: "moving",
                  lat: unit.lat + (dLat / dist) * step,
                  lng: unit.lng + (dLng / dist) * step,
                  path: unit.path ? [...unit.path, [unit.lat, unit.lng]] : [[unit.lat, unit.lng]],
                };
              }
            }
          }
          return currentAlerts;
        });

        if (unit.status === "moving" && !unit.path) {
          return {
            ...unit,
            lat: unit.lat + (Math.random() - 0.5) * 0.0005,
            lng: unit.lng + (Math.random() - 0.5) * 0.0005,
          };
        } else if (unit.status === "moving") {
           // Allow dispatched unit to keep its updated state from the alert check
           return unit;
        }
        return unit;
      }));

    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const hasActiveSOS = alerts.some((a) => !a.responded);

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const respondToAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true, responded: true } : a));
  };

  const dispatchUnit = (alertId: string, unitId: string) => {
    setAlerts((prev) => prev.map((a) => a.id === alertId ? { ...a, dispatchedUnitId: unitId } : a));
  };

  const simulateSOS = () => {
    const newAlert: SOSAlert = {
      id: `ALERT-${Date.now()}`,
      unitId: "UNIT-01",
      unitName: "NDRF Alpha",
      coords: "11.5542° N, 76.1511° E",
      sector: "Sector A — Chooralmala",
      timestamp: new Date().toTimeString().slice(0, 8),
      elapsed: "just now",
      acknowledged: false,
      responded: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  return (
    <AppContext.Provider value={{ 
      units, alerts, hasActiveSOS, missionTime, isOffline, 
      acknowledgeAlert, respondToAlert, dispatchUnit, simulateSOS, 
      theme, toggleTheme, rainRate, landslideRisk: getLandslideRisk(rainRate) 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}