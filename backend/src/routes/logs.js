import express from 'express';
import { getFirestore } from '../config/firebase.js';

const router = express.Router();

// Get logs for a user
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { startDate, endDate } = req.query;
    const db = getFirestore();
    
    let query = db.collection('logs').where('userId', '==', uid);

    if (startDate) {
      query = query.where('timestamp', '>=', startDate);
    }
    if (endDate) {
      query = query.where('timestamp', '<=', endDate);
    }

    query = query.orderBy('timestamp', 'desc').limit(100);
    
    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new log entry
router.post('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const logData = req.body;
    const db = getFirestore();
    
    const docRef = await db.collection('logs').add({
      userId: uid,
      ...logData,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    
    res.json({ id: docRef.id, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

