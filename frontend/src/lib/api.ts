import {
  StatsResponse,
  TimelinePoint,
  HotspotPoint,
  Kingpin,
  mockStats,
  mockTimeline,
  generateMockHotspots,
  generateMockKingpins,
} from "./mockData";

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/**
 * Fetch data from backend API with proper error handling
 * @param path API endpoint path
 * @param options Fetch options
 * @returns Parsed JSON response
 * @throws Error if request fails
 */
async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    return (await res.json()) as T;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend may be offline');
      }
      throw new Error(`API Error: ${error.message}`);
    }
    throw new Error('Unknown API error occurred');
  }
}

export const api = {
  /**
   * Fetch overview statistics including total incidents, criminals, associations, and crime breakdown
   */
  stats: async () => {
    try {
      return await fetchAPI<StatsResponse>("/api/v1/overview/stats");
    } catch (e) {
      console.warn("Backend unavailable, falling back to mock stats");
      return mockStats;
    }
  },
  
  /**
   * Fetch timeline data with anomaly detection results
   */
  timeline: async () => {
    try {
      return await fetchAPI<TimelinePoint[]>("/api/v1/analytics/timeline");
    } catch (e) {
      console.warn("Backend unavailable, falling back to mock timeline");
      return mockTimeline;
    }
  },
  
  /**
   * Fetch geospatial hotspot data with optional limit
   * @param limit Maximum number of hotspots to return (default: 1200)
   */
  hotspots: async (limit = 1200) => {
    try {
      return await fetchAPI<HotspotPoint[]>(`/api/v1/geospatial/hotspots?limit=${limit}`);
    } catch (e) {
      console.warn("Backend unavailable, falling back to mock hotspots");
      return generateMockHotspots(limit);
    }
  },
  
  /**
   * Fetch top criminal kingpins ranked by network connections
   * @param topN Number of kingpins to return (default: 15)
   */
  kingpins: async (topN = 15) => {
    try {
      return await fetchAPI<Kingpin[]>(`/api/v1/network/kingpins?top_n=${topN}`);
    } catch (e) {
      console.warn("Backend unavailable, falling back to mock kingpins");
      return generateMockKingpins(topN);
    }
  },
  
  /**
   * Predict threat level using Random Forest ML model
   * @param payload Suspect profile data (age, base_risk_score, connections)
   * @returns Prediction result with threat level, confidence, and probabilities
   */
  predictRisk: async (payload: { age: number; base_risk_score: number; connections: number }) => {
    try {
      return await fetchAPI<PredictionResult>("/api/v1/predict-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("Backend unavailable, falling back to mock prediction");
      // Calculate a pseudo-random result based on payload for the mock
      const risk = payload.base_risk_score + payload.connections * 2;
      const prediction = risk > 80 ? "Critical" : risk > 60 ? "High" : risk > 40 ? "Medium" : "Low";
      return {
        prediction,
        confidence: 0.85,
        probabilities: { Low: 0.1, Medium: 0.2, High: 0.3, Critical: 0.4 },
        model: "Random Forest (Mock Fallback)"
      };
    }
  },
};

export interface PredictionResult {
  prediction: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  probabilities: { Low: number; Medium: number; High: number; Critical: number };
  model: string;
}