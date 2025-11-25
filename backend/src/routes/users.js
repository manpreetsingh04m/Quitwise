import express from 'express';
import { getFirestore } from '../config/firebase.js';

const router = express.Router();

// Get user profile
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(userDoc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update user profile
router.post('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const userData = req.body;
    const db = getFirestore();
    
    await db.collection('users').doc(uid).set({
      ...userData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

