import express from 'express';
import { getAuth } from '../config/firebase.js';

const router = express.Router();

// Verify Firebase token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    res.json({ 
      uid: decodedToken.uid,
      email: decodedToken.email,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

