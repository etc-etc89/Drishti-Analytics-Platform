// Type definitions and constants for crime analytics
// Mock data generators are kept for development/testing purposes only

export const CRIME_TYPES = [
  "Theft",
  "Vehicle Theft",
  "Fraud",
  "Cybercrime",
  "Assault",
  "Burglary",
  "Murder",
] as const;

export const CRIME_COLORS: Record<string, string> = {
  Theft: "#F97316",
  "Vehicle Theft": "#FB7185",
  Fraud: "#FBBF24",
  Cybercrime: "#818CF8",
  Assault: "#F472B6",
  Burglary: "#A78BFA",
  Murder: "#DC2626",
};

export const THREAT_COLORS: Record<string, string> = {
  Low: "#22C55E",
  Medium: "#F59E0B",
  High: "#F97316",
  Critical: "#DC2626",
};

export type ThreatLevel = "Low" | "Medium" | "High" | "Critical";

export interface StatsResponse {
  total_incidents: number;
  total_criminals: number;
  total_associations: number;
  districts_monitored: number;
  crime_breakdown: { name: string; value: number }[];
  active_alerts: number;
}

export interface TimelinePoint {
  month: string;
  incidents: number;
  anomalyScore: number;
  isAnomaly: boolean;
  dominantCrime: string;
  avgHour: number;
  avgDayOfWeek: number;
}

export interface HotspotPoint {
  id: string;
  lat: number;
  lon: number;
  crime_type: string;
  district: string;
}

export interface Kingpin {
  criminal_id: string;
  name: string;
  age: number;
  base_risk_score: number;
  threat_level: ThreatLevel;
  connections: number;
}

// deterministic pseudo-random
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const mockStats: StatsResponse = {
  total_incidents: 15423,
  total_criminals: 8547,
  total_associations: 12089,
  districts_monitored: 742,
  active_alerts: 12,
  crime_breakdown: [
    { name: "Theft", value: 4218 },
    { name: "Vehicle Theft", value: 2634 },
    { name: "Fraud", value: 2105 },
    { name: "Cybercrime", value: 1876 },
    { name: "Assault", value: 1732 },
    { name: "Burglary", value: 1543 },
    { name: "Murder", value: 1315 },
  ],
};

export const mockTimeline: TimelinePoint[] = (() => {
  const r = rng(42);
  const months = 24;
  const start = new Date(2024, 0, 1);
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    const base = 500 + Math.round(r() * 180);
    const spike = i === 4 || i === 11 || i === 18 || i === 22;
    const incidents = spike ? base + Math.round(180 + r() * 180) : base;
    const anomalyScore = spike ? 65 + Math.round(r() * 30) : Math.round(r() * 40);
    return {
      month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      incidents,
      anomalyScore,
      isAnomaly: spike,
      dominantCrime: CRIME_TYPES[Math.floor(r() * CRIME_TYPES.length)],
      avgHour: Math.round(8 + r() * 14),
      avgDayOfWeek: Math.round(r() * 6),
    };
  });
})();

// Karnataka approximate bounds
const KARNATAKA_BOUNDS = { minLat: 11.6, maxLat: 18.4, minLon: 74.0, maxLon: 78.6 };

export const KARNATAKA_CITIES = [
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Mysuru", lat: 12.2958, lon: 76.6394 },
  { name: "Mangaluru", lat: 12.9141, lon: 74.856 },
  { name: "Hubballi", lat: 15.3647, lon: 75.124 },
  { name: "Belagavi", lat: 15.8497, lon: 74.4977 },
  { name: "Kalaburagi", lat: 17.3297, lon: 76.8343 },
];

export function generateMockHotspots(count = 1200): HotspotPoint[] {
  const r = rng(7);
  return Array.from({ length: count }, (_, i) => {
    // bias toward major cities
    const useCity = r() < 0.65;
    let lat: number, lon: number;
    if (useCity) {
      const c = KARNATAKA_CITIES[Math.floor(r() * KARNATAKA_CITIES.length)];
      lat = c.lat + (r() - 0.5) * 0.5;
      lon = c.lon + (r() - 0.5) * 0.5;
    } else {
      lat = KARNATAKA_BOUNDS.minLat + r() * (KARNATAKA_BOUNDS.maxLat - KARNATAKA_BOUNDS.minLat);
      lon = KARNATAKA_BOUNDS.minLon + r() * (KARNATAKA_BOUNDS.maxLon - KARNATAKA_BOUNDS.minLon);
    }
    return {
      id: `INC-${100000 + i}`,
      lat,
      lon,
      crime_type: CRIME_TYPES[Math.floor(r() * CRIME_TYPES.length)],
      district: `District ${Math.floor(r() * 30) + 1}`,
    };
  });
}

const FIRST_NAMES = [
  "Rahul", "Vijay", "Arjun", "Suresh", "Manoj", "Ravi", "Kiran", "Prakash",
  "Anil", "Sanjay", "Deepak", "Rohan", "Vikram", "Ajay", "Rajesh",
];
const LAST_NAMES = [
  "Kumar", "Reddy", "Naidu", "Gowda", "Rao", "Shetty", "Patil", "Iyer",
  "Nair", "Menon", "Hegde", "Bhat", "Desai", "Prasad", "Murthy",
];

export function generateMockKingpins(count = 50): Kingpin[] {
  const r = rng(3);
  return Array.from({ length: count }, (_, i) => {
    const risk = Math.round(20 + r() * 80);
    const connections = Math.round(3 + r() * 45);
    const threat: ThreatLevel =
      risk > 80 ? "Critical" : risk > 65 ? "High" : risk > 45 ? "Medium" : "Low";
    return {
      criminal_id: `KSP-${String(1000 + i).padStart(5, "0")}`,
      name: `${FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(r() * LAST_NAMES.length)]}`,
      age: Math.round(18 + r() * 42),
      base_risk_score: risk,
      threat_level: threat,
      connections,
    };
  }).sort((a, b) => b.connections - a.connections);
}

export const RECENT_INCIDENTS = [
  { id: "INC-24019", type: "Cybercrime", district: "Bengaluru South", status: "Active", time: "12 min ago" },
  { id: "INC-24018", type: "Vehicle Theft", district: "Mysuru", status: "Investigating", time: "38 min ago" },
  { id: "INC-24017", type: "Fraud", district: "Hubballi", status: "Active", time: "1h ago" },
  { id: "INC-24016", type: "Assault", district: "Mangaluru", status: "Resolved", time: "2h ago" },
  { id: "INC-24015", type: "Burglary", district: "Belagavi", status: "Investigating", time: "3h ago" },
  { id: "INC-24014", type: "Theft", district: "Kalaburagi", status: "Active", time: "4h ago" },
];