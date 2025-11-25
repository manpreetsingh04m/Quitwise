// Assessment Types
export type DependenceLevel = "low" | "moderate" | "high";
export type TriggerCategory = "stress" | "social" | "boredom" | "habit" | "other";
export type MoodLevel = "very-low" | "low" | "neutral" | "good" | "very-good";
export type QuitStrategy = "gradual" | "cold-turkey" | "tapering";

// Psychological Profile
export interface PsychologicalProfile {
  frequency: number; // times per day
  pattern: string; // description
  situations: string[]; // situations where they use
  moods: string[]; // moods when they use
  triggers: TriggerCategory[];
  motivationRating: number; // 1-10
  confidenceRating: number; // 1-10
  moodBaseline: {
    anxiety: number; // 1-10
    depression: number; // 1-10
    stress: number; // 1-10
  };
}

// Economic Profile
export interface EconomicProfile {
  costPerUnit: number; // cost per cigarette/pod
  dailySpending: number;
  weeklySpending: number;
  financialGoals: FinancialGoal[];
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentProgress: number;
}

// Assessment Result
export interface AssessmentResult {
  score: number;
  level: DependenceLevel;
  completedAt: string; // ISO string
  psychologicalProfile?: PsychologicalProfile;
  economicProfile?: EconomicProfile;
  quitGoal?: QuitGoal;
  riskProfile?: RiskProfile;
}

// Quit Goal
export interface QuitGoal {
  strategy: QuitStrategy;
  quitDate: string; // ISO string
  targetReduction?: number; // for gradual/tapering
  maxPerDay?: number; // for tapering
}

// Risk Profile
export interface RiskProfile {
  highRiskTimes: number[]; // hours of day (0-23)
  mainTriggers: TriggerCategory[];
  riskLevel: "low" | "moderate" | "high";
}

// Log Entry
export interface LogEntry {
  id?: string;
  userId: string;
  type: "use" | "craving" | "resisted";
  timestamp: string; // ISO string
  moodBefore?: MoodLevel;
  moodAfter?: MoodLevel;
  trigger?: TriggerCategory;
  intensity?: number; // 1-10 for cravings
  resisted?: boolean;
  notes?: string;
  cost?: number; // calculated cost
}

// Savings Calculation
export interface SavingsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  sixMonths: number;
  oneYear: number;
  totalSinceQuit: number;
  daysSinceQuit: number;
}

// JITAI (Just-in-Time Adaptive Intervention)
export interface JITAI {
  id: string;
  userId: string;
  scheduledTime: string; // ISO string
  riskWindow: number; // hour of day
  interventionType: "breathing" | "cbt-prompt" | "urge-surfing" | "economic-nudge";
  message: string;
  delivered: boolean;
  deliveredAt?: string;
}

// CBT Content
export interface CBTLesson {
  id: string;
  title: string;
  content: string;
  readingTime: number; // minutes
  category: "psychoeducation" | "exercise" | "technique";
  unlocked: boolean;
  order: number;
}

export interface CBTExercise {
  id: string;
  title: string;
  type: "thought-record" | "trigger-response" | "problem-solving";
  instructions: string;
  template?: any;
}

// Commitment Contract
export interface CommitmentContract {
  id: string;
  userId: string;
  plan: {
    maxPerDay?: number;
    totalAbstinence?: boolean;
    startDate: string;
    endDate: string;
  };
  stake: number; // points/tokens at risk
  status: "active" | "completed" | "violated";
  violations: number;
}

// Reward & Badge
export interface Reward {
  id: string;
  cost: number;
  label: string;
  icon?: string;
  category: "badge" | "achievement" | "self-reward";
  unlocked?: boolean;
  unlockedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: "streak" | "total-days" | "milestone";
    value: number;
  };
  unlocked: boolean;
  unlockedAt?: string;
}

// Streak Data
export interface StreakData {
  currentStreak: number; // days
  longestStreak: number;
  lastUseTimestamp: number | null;
  streakHours: number;
}

// Token Data
export interface TokenData {
  lastUseTimestamp: number | null;
  tokens: number;
  streakHours: number;
}

// Analytics
export interface UserAnalytics {
  totalUses: number;
  totalCravings: number;
  resistedCravings: number;
  totalSpent: number;
  totalSaved: number;
  daysSinceQuit: number;
  riskWindows: number[];
  costPerUnit: number;
  savingsData: SavingsData;
}

// Community
export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string; // anonymous display name
  content: string;
  stage: "day-0-7" | "day-8-30" | "day-31-plus" | "relapse-restart";
  createdAt: string;
  likes: number;
  comments: Comment[];
  likedBy?: string[];
  likedDevices?: string[];
}

export interface Comment {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// User Profile
export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
  assessment?: AssessmentResult;
  streakData?: StreakData;
  tokens: number;
  badges: Badge[];
  commitmentContract?: CommitmentContract;
  selfRewards: SelfReward[];
  completedLessons?: string[];
  notificationToken?: string;
}

export interface SelfReward {
  id: string;
  description: string;
  targetDate: string;
  milestone: number; // days
  completed: boolean;
}

// Question (for assessment)
export interface Question {
  id: number;
  text: string;
  category: "psychological" | "economic" | "general";
  options: {
    text: string;
    score: number;
  }[];
}

// Reason to Quit
export interface ReasonToQuit {
  id: string;
  text: string;
}

// If-Then Plan
export interface IfThenPlan {
  id: string;
  trigger: string;
  action: string;
}
