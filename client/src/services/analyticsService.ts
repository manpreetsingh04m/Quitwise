import type { LogEntry, UserProfile, SavingsData, UserAnalytics } from '../types';
import { getUserLogs, getUserProfile } from './firebaseService';

export const calculateSavings = (
  userProfile: UserProfile | null,
  daysSinceQuit: number
): SavingsData => {
  if (!userProfile?.assessment?.economicProfile) {
    return {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      sixMonths: 0,
      oneYear: 0,
      totalSinceQuit: 0,
      daysSinceQuit: 0,
    };
  }

  const { costPerUnit, dailySpending } = userProfile.assessment.economicProfile;
  const dailyUsage = userProfile.assessment.psychologicalProfile?.frequency || 0;
  const dailyCost = dailyUsage * costPerUnit;

  const today = dailyCost;
  const thisWeek = dailyCost * 7;
  const thisMonth = dailyCost * 30;
  const sixMonths = dailyCost * 180;
  const oneYear = dailyCost * 365;
  const totalSinceQuit = dailyCost * daysSinceQuit;

  return {
    today,
    thisWeek,
    thisMonth,
    sixMonths,
    oneYear,
    totalSinceQuit,
    daysSinceQuit,
  };
};

export const calculateStreak = (lastUseTimestamp: number | null): { days: number; hours: number } => {
  if (!lastUseTimestamp) {
    // If never used, calculate from account creation or quit date
    return { days: 0, hours: 0 };
  }

  const now = Date.now();
  const diff = now - lastUseTimestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return { days, hours };
};

export const analyzeRiskWindows = (logs: LogEntry[]): number[] => {
  const hourCounts: Record<number, number> = {};

  logs.forEach(log => {
    if (log.timestamp) {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  // Find top 3 risk hours
  const sortedHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  return sortedHours;
};

export const getUserAnalytics = async (uid: string): Promise<UserAnalytics> => {
  const userProfile = await getUserProfile(uid);
  if (!userProfile) {
    throw new Error('User profile not found');
  }

  const logs = await getUserLogs(uid);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentLogs = logs.filter(log => new Date(log.timestamp) >= thirtyDaysAgo);

  const totalUses = logs.filter(log => log.type === 'use').length;
  const totalCravings = logs.filter(log => log.type === 'craving').length;
  const resistedCravings = logs.filter(log => log.type === 'craving' && log.resisted).length;

  const costPerUnit = userProfile.assessment?.economicProfile?.costPerUnit || 0;
  const totalSpent = totalUses * costPerUnit;

  // Calculate days since quit
  const quitDate = userProfile.assessment?.quitGoal?.quitDate;
  let daysSinceQuit = 0;
  if (quitDate) {
    const quit = new Date(quitDate);
    const now = new Date();
    daysSinceQuit = Math.floor((now.getTime() - quit.getTime()) / (1000 * 60 * 60 * 24));
  }

  const savingsData = calculateSavings(userProfile, daysSinceQuit);
  const riskWindows = analyzeRiskWindows(recentLogs);

  return {
    totalUses,
    totalCravings,
    resistedCravings,
    totalSpent,
    totalSaved: savingsData.totalSinceQuit,
    daysSinceQuit,
    riskWindows,
    costPerUnit,
    savingsData,
  };
};

