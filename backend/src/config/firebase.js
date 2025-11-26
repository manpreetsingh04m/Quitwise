import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let firebaseAdminInitialized = false;

export const initializeFirebaseAdmin = () => {
  if (firebaseAdminInitialized) {
    return;
  }

  try {
    // For production, use service account
    if (process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    } else {
      // For development, use default credentials or emulator
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'quitwise-dev',
      });
    }

    firebaseAdminInitialized = true;
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
};

export const getFirestore = () => {
  if (!firebaseAdminInitialized) {
    initializeFirebaseAdmin();
  }
  return admin.firestore();
};

export const getAuth = () => {
  if (!firebaseAdminInitialized) {
    initializeFirebaseAdmin();
  }
  return admin.auth();
};

export const getMessaging = () => {
  if (!firebaseAdminInitialized) {
    initializeFirebaseAdmin();
  }
  return admin.messaging();
};

export { admin };

