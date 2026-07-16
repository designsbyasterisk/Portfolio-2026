export type UnitStatus = "moving" | "stationary" | "sos" | "disconnected";
export type UnitType = "personnel" | "stretcher";

export interface Unit {
  id: string;
  name: string;
  role: string;
  radio: string;
  type: UnitType;
  status: UnitStatus;
  battery: number;
  signal: 0 | 1 | 2 | 3 | 4;
  lat: number;
  lng: number;
  sector: string;
  distanceKm: number;
  speed: number;
  team: string[];
  loadStatus?: "empty" | "loaded"; // for stretchers
  path?: [number, number][]; // route taken
}

export interface SOSAlert {
  id: string;
  unitId: string;
  unitName: string;
  coords: string;
  sector: string;
  timestamp: string;
  elapsed: string;
  acknowledged: boolean;
  responded: boolean;
  dispatchedUnitId?: string;
}

export interface IncidentLog {
  id: string;
  unitId: string;
  date: string;
  time: string;
  type: "SOS" | "maintenance" | "movement";
  description: string;
  resolved: boolean;
  duration?: string;
}

// Wayanad centered roughly at 11.6854° N, 76.1320° E
// We will scatter units slightly around this region (Meppadi / Chooralmala area)
export const units: Unit[] = [
  {
    id: "UNIT-01",
    name: "NDRF Alpha",
    role: "Team Lead",
    radio: "CH-01",
    type: "personnel",
    status: "moving",
    battery: 88,
    signal: 4,
    lat: 11.5542, // Chooralmala region approx
    lng: 76.1511,
    sector: "Sector A — Chooralmala",
    distanceKm: 1.2,
    speed: 2.4,
    team: ["Rajesh K.", "Anjali P."],
    path: [[11.5650, 76.1450], [11.5600, 76.1450], [11.5580, 76.1480], [11.5560, 76.1500], [11.5542, 76.1511]],
  },
  {
    id: "UNIT-02",
    name: "Medic Bravo",
    role: "Medical",
    radio: "CH-02",
    type: "stretcher",
    status: "stationary",
    battery: 61,
    signal: 3,
    lat: 11.5560,
    lng: 76.1550,
    sector: "Sector A — Base Camp",
    distanceKm: 0.4,
    speed: 0,
    team: ["Dr. Harish N."],
    loadStatus: "empty",
    path: [[11.5650, 76.1450], [11.5500, 76.1580], [11.5530, 76.1560], [11.5560, 76.1550]],
  },
  {
    id: "UNIT-03",
    name: "SDRF Charlie",
    role: "Forward Scout",
    radio: "CH-03",
    type: "personnel",
    status: "sos",
    battery: 15,
    signal: 1,
    lat: 11.5490,
    lng: 76.1600,
    sector: "Sector B — Mundakkai",
    distanceKm: 2.8,
    speed: 0,
    team: ["Vishnu Das", "Karthik R."],
    path: [[11.5650, 76.1450], [11.5560, 76.1550], [11.5520, 76.1580], [11.5490, 76.1600]],
  },
  {
    id: "UNIT-04",
    name: "Logistics Delta",
    role: "Support",
    radio: "CH-04",
    type: "personnel",
    status: "disconnected",
    battery: 0,
    signal: 0,
    lat: 11.5600,
    lng: 76.1400,
    sector: "Sector C — Meppadi",
    distanceKm: 3.5,
    speed: 0,
    team: ["Sajith M."],
    path: [[11.5650, 76.1450], [11.5650, 76.1350], [11.5620, 76.1380], [11.5600, 76.1400]],
  },
  {
    id: "UNIT-05",
    name: "Echo Rescue",
    role: "Rescue Lead",
    radio: "CH-05",
    type: "stretcher",
    status: "moving",
    battery: 92,
    signal: 4,
    lat: 11.5510,
    lng: 76.1580,
    sector: "Sector B — Mundakkai South",
    distanceKm: 4.2,
    speed: 1.8,
    team: ["Arun V.", "Priya S."],
    loadStatus: "loaded",
    path: [[11.5650, 76.1450], [11.5450, 76.1500], [11.5480, 76.1540], [11.5510, 76.1580]],
  },
];

export const sosAlerts: SOSAlert[] = [
  {
    id: "ALERT-001",
    unitId: "UNIT-03",
    unitName: "SDRF Charlie",
    coords: "11.5490° N, 76.1600° E",
    sector: "Sector B — Mundakkai",
    timestamp: "14:32:07",
    elapsed: "4m ago",
    acknowledged: false,
    responded: false,
  },
];

export const incidentLogs: IncidentLog[] = [
  { id: "INC-007", unitId: "UNIT-03", date: "2026-07-30", time: "14:32:07", type: "SOS", description: "SOS triggered at Mundakkai. Secondary debris flow reported.", resolved: false },
  { id: "INC-006", unitId: "UNIT-02", date: "2026-07-29", time: "09:14:33", type: "SOS", description: "Stretcher harness failure near Chooralmala bridge. Resolved.", resolved: true, duration: "22min" },
  { id: "INC-005", unitId: "UNIT-01", date: "2026-07-28", time: "16:48:12", type: "maintenance", description: "GPS module showing intermittent readings due to heavy rain.", resolved: true, duration: "8min" },
];

export const maintenanceLogs = [
  { id: "M-004", unitId: "UNIT-03", date: "2026-07-30", issue: "Battery depleted — critical", severity: "high", flagged: true },
  { id: "M-003", unitId: "UNIT-04", date: "2026-07-30", issue: "NFC chipset damaged", severity: "high", flagged: true },
];

export const personnelAssignments = [
  { unitId: "UNIT-01", members: ["Rajesh K. — Team Lead", "Anjali P. — Navigator"], radioChannel: "CH-01" },
  { unitId: "UNIT-02", members: ["Dr. Harish N. — Medic"], radioChannel: "CH-02" },
  { unitId: "UNIT-03", members: ["Vishnu Das — Scout", "Karthik R. — Scout Support"], radioChannel: "CH-03" },
  { unitId: "UNIT-04", members: ["Sajith M. — Logistics"], radioChannel: "CH-04" },
  { unitId: "UNIT-05", members: ["Arun V. — Rescue Lead", "Priya S. — Medic Assist"], radioChannel: "CH-05" },
];

export const movementPaths = [
  { unitId: "UNIT-01", date: "2026-07-30", totalDistanceKm: 4.8, durationMin: 120, waypoints: 12, avgSpeed: 2.4, notes: "Optimal route — recommend archiving." },
  { unitId: "UNIT-05", date: "2026-07-30", totalDistanceKm: 2.1, durationMin: 70, waypoints: 8, avgSpeed: 1.8, notes: "New southern trail identified. 15% faster than previous route." },
  { unitId: "UNIT-02", date: "2026-07-29", totalDistanceKm: 1.2, durationMin: 40, waypoints: 5, avgSpeed: 1.8, notes: "Medical supply route established." },
];
