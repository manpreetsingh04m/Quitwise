import express from 'express';
import { getFirestore, admin } from '../config/firebase.js';
import { checkAndSendJITAIs } from '../scheduler.js';

const router = express.Router();
const db = getFirestore();

// Handler function for checking and sending JITAIs
const handleCheckJITAIs = async (req, res) => {
  try {
    const result = await checkAndSendJITAIs();
    res.json({ 
      success: true, 
      message: `JITAI check completed. Sent: ${result.sent}, Errors: ${result.errors}`,
      sent: result.sent,
      errors: result.errors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking JITAIs:', error);
    res.status(500).json({ error: error.message });
  }
};

// Check and send pending JITAIs (POST for manual triggers)
router.post('/check-jitais', handleCheckJITAIs);

// Check and send pending JITAIs (GET for Vercel Cron Jobs)
router.get('/check-jitais', handleCheckJITAIs);

// Legacy endpoint - kept for backward compatibility
router.post('/check-jitais-legacy', async (req, res) => {
  try {
    const now = new Date();
    const jitaisRef = db.collection('jitais');
    
    // Find all pending JITAIs that are due
    let snapshot;
    try {
      snapshot = await jitaisRef
        .where('delivered', '==', false)
        .where('scheduledTime', '<=', admin.firestore.Timestamp.fromDate(now))
        .get();
    } catch (indexError) {
      if (indexError.code === 9 || indexError.message?.includes('index')) {
        // Index not created yet - use alternative approach
        const allUndelivered = await jitaisRef
          .where('delivered', '==', false)
          .get();
        
        // Filter by scheduledTime in memory
        const filteredDocs = allUndelivered.docs.filter(doc => {
          const scheduledTime = doc.data().scheduledTime;
          if (!scheduledTime) return false;
          const scheduledDate = scheduledTime.toDate ? scheduledTime.toDate() : new Date(scheduledTime);
          return scheduledDate <= now;
        });
        
        snapshot = {
          docs: filteredDocs,
          get empty() { return this.docs.length === 0; }
        };
      } else {
        throw indexError;
      }
    }

    if (snapshot.empty) {
      return res.json({ 
        success: true, 
        message: 'No pending JITAIs to send',
        count: 0 
      });
    }

    const results = [];
    
    for (const doc of snapshot.docs) {
      const jitai = { id: doc.id, ...doc.data() };
      const userRef = db.collection('users').doc(jitai.userId);
      const userDoc = await userRef.get();
      
      const userData = userDoc.data();
      // Check token, fcmToken (legacy), and notificationToken (legacy) fields
      const fcmToken = userData?.token || userData?.fcmToken || userData?.notificationToken;
      
      if (!userDoc.exists() || !fcmToken) {
        continue;
      }
      
      // Validate token format
      if (!fcmToken || typeof fcmToken !== 'string' || fcmToken.length < 100) {
        results.push({ jitaiId: jitai.id, status: 'skipped', reason: 'Invalid token format' });
        continue;
      }
      
      try {
        const message = {
          notification: {
            title: 'QuitWise Intervention',
            body: jitai.message,
          },
          data: {
            type: 'jitai',
            jitaiId: jitai.id,
            interventionType: jitai.interventionType || 'general',
          },
          token: fcmToken,
        };

        await admin.messaging().send(message);
        
        // Mark as delivered
        await doc.ref.update({
          delivered: true,
          deliveredAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        results.push({ jitaiId: jitai.id, status: 'sent' });
      } catch (error) {
        // Handle invalid token - remove it from user profile
        if (error.code === 'messaging/invalid-argument' || 
            error.message?.includes('registration token is not a valid')) {
          try {
            // Remove token field (and legacy fields)
            await userRef.update({
              token: admin.firestore.FieldValue.delete(),
              fcmToken: admin.firestore.FieldValue.delete(),
            });
          } catch (updateError) {
            console.error(`Error removing invalid token:`, updateError);
          }
          results.push({ 
            jitaiId: jitai.id, 
            status: 'error', 
            error: 'Invalid token (removed from profile)', 
            code: 'INVALID_TOKEN' 
          });
        } else {
          console.error(`Error sending JITAI ${jitai.id}:`, error);
          results.push({ jitaiId: jitai.id, status: 'error', error: error.message });
        }
      }
    }

    res.json({
      success: true,
      message: `Processed ${results.length} JITAIs`,
      results,
    });
  } catch (error) {
    console.error('Error checking JITAIs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pending JITAIs for a user
router.get('/jitais/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { delivered } = req.query;

    let query = db.collection('jitais').where('userId', '==', uid);

    if (delivered !== undefined) {
      query = query.where('delivered', '==', delivered === 'true');
    }

    const snapshot = await query.orderBy('scheduledTime', 'desc').get();
    const jitais = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledTime: doc.data().scheduledTime?.toDate?.()?.toISOString() || doc.data().scheduledTime,
      deliveredAt: doc.data().deliveredAt?.toDate?.()?.toISOString() || doc.data().deliveredAt,
    }));

    res.json({ jitais });
  } catch (error) {
    console.error('Error getting JITAIs:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

