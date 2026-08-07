export type AppTab = "home" | "map" | "scan" | "assistant" | "impact";

export type SignalCategory =
  | "plastic"
  | "oil"
  | "wildlife"
  | "illegal_fishing"
  | "water";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type SignalStatus = "draft" | "queued" | "verified" | "resolved";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface EnvironmentalSignal {
  id: string;
  category: SignalCategory;
  title: string;
  locationLabel: string;
  coordinates: Coordinates;
  risk: RiskLevel;
  status: SignalStatus;
  createdAt: string;
  confidence: number;
  imageUri?: string;
  evidenceHash?: string;
  description?: string;
  source: "community" | "sensor" | "satellite" | "demo";
}

export interface AnalysisResult {
  category: SignalCategory;
  title: string;
  summary: string;
  risk: RiskLevel;
  confidence: number;
  detected: string[];
  nextStep: string;
  model: "local-demo" | "remote-ai";
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  icon: string;
}

