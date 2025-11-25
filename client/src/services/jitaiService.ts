import type { LogEntry, UserProfile, JITAI } from '../types';
import { getUserLogs, getUserProfile, createJITAI } from './firebaseService';
import { analyzeRiskWindows } from './analyticsService';

export const generateJITAIs = async (uid: string): Promise<void> => {
  const userProfile = await getUserProfile(uid);
  if (!userProfile) return;

  const logs = await getUserLogs(uid, undefined, undefined, 100);
  const riskWindows = analyzeRiskWindows(logs);

  // Generate JITAIs for each risk window
  for (const hour of riskWindows) {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, 0, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Create different types of interventions
    const interventions = [
      {
        type: 'breathing' as const,
        message: 'Take a moment. Breathe in for 4, hold for 4, breathe out for 4. You\'ve got this.',
      },
      {
        type: 'cbt-prompt' as const,
        message: 'What are you feeling right now? Is smoking the only solution?',
      },
      {
        type: 'economic-nudge' as const,
        message: `If you skip this cigarette, today's saving becomes ₹${(userProfile.assessment?.economicProfile?.costPerUnit || 0).toFixed(2)}.`,
      },
      {
        type: 'urge-surfing' as const,
        message: 'Ride the craving for 5 minutes, then re-evaluate. Cravings pass.',
      },
    ];

    // Create one intervention per risk window (rotate types)
    const intervention = interventions[hour % interventions.length];

    await createJITAI(uid, {
      scheduledTime: scheduledTime.toISOString(),
      riskWindow: hour,
      interventionType: intervention.type,
      message: intervention.message,
    });
  }
};

export const checkAndDeliverJITAIs = async (uid: string): Promise<JITAI[]> => {
  // This would typically be called by a background service or when app opens
  // For now, we'll implement client-side checking
  const userProfile = await getUserProfile(uid);
  if (!userProfile) return [];

  // In a real implementation, you'd fetch pending JITAIs from Firestore
  // and check if it's time to deliver them
  // For now, this is a placeholder that would be enhanced with actual scheduling logic

  return [];
};

