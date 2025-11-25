import express from 'express';
import { getFirestore } from '../config/firebase.js';

const router = express.Router();

// Get analytics for a user
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const db = getFirestore();
    
    // Get user profile for cost calculations
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get logs from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const logsSnapshot = await db.collection('logs')
      .where('userId', '==', uid)
      .where('timestamp', '>=', thirtyDaysAgo.toISOString())
      .get();
    
    const logs = logsSnapshot.docs.map(doc => doc.data());
    
    // Calculate analytics
    const totalUses = logs.filter(log => log.type === 'use').length;
    const totalCravings = logs.filter(log => log.type === 'craving').length;
    const resistedCravings = logs.filter(log => log.type === 'craving' && log.resisted).length;
    
    const costPerUnit = userData.economicProfile?.costPerUnit || 0;
    const totalSpent = totalUses * costPerUnit;
    
    // Calculate savings (based on quit date or goal)
    const quitDate = userData.quitGoal?.quitDate;
    let totalSaved = 0;
    let daysSinceQuit = 0;
    
    if (quitDate) {
      const quit = new Date(quitDate);
      const now = new Date();
      daysSinceQuit = Math.floor((now - quit) / (1000 * 60 * 60 * 24));
      const dailyUsage = userData.psychologicalProfile?.dailyUsage || 0;
      totalSaved = daysSinceQuit * dailyUsage * costPerUnit;
    }
    
    // Risk windows analysis
    const riskWindows = analyzeRiskWindows(logs);
    
    res.json({
      totalUses,
      totalCravings,
      resistedCravings,
      totalSpent,
      totalSaved,
      daysSinceQuit,
      riskWindows,
      costPerUnit,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function analyzeRiskWindows(logs) {
  const hourCounts = {};
  
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
}

export default router;

