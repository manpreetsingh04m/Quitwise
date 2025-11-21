export type DependenceLevel = "low" | "moderate" | "high";

export interface AssessmentResult {
  score: number;
  level: DependenceLevel;
  completedAt: string; // ISO string
}

export interface TokenData {
  lastUseTimestamp: number | null;
  tokens: number;
  streakHours: number;
}

export interface ReasonToQuit {
  id: string;
  text: string;
}

export interface IfThenPlan {
  id: string;
  trigger: string;
  action: string;
}

export interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    score: number;
  }[];
}

export interface Reward {
  id: string;
  cost: number;
  label: string;
  icon?: string;
}
