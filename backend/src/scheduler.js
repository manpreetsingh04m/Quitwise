import { getFirestore, admin } from './config/firebase.js';

const db = getFirestore();

/**
 * Check and send pending JITAIs that are due
 * This function should be called periodically (e.g., every 15 minutes)
 */
export const checkAndSendJITAIs = async () => {
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
      return { sent: 0, errors: 0 };
    }

    let sent = 0;
    let errors = 0;
    
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

        sent++;
      } catch (error) {
        errors++;
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
        } else {
          console.error(`Error sending JITAI ${jitai.id}:`, error);
        }
      }
    }

    return { sent, errors };
  } catch (error) {
    console.error('Error checking JITAIs:', error);
    throw error;
  }
};

