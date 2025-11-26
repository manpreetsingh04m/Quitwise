import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const getEnvVar = (key: string) => {
  const value = import.meta.env[key as keyof ImportMetaEnv];
  if (!value) {
    throw new Error(`Missing required Firebase environment variable: ${key}`);
  }
  return value;
};

requiredEnvVars.forEach(getEnvVar);

// Firebase configuration
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser)
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch {
    // Analytics not available
  }
}

export { analytics };

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize messaging (for push notifications)
let messaging: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== 'undefined' && 'Notification' in window) {
  try {
    messaging = getMessaging(app);
  } catch {
    // Messaging not available
  }
}

export { messaging };

// Register service worker for background notifications
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      serviceWorkerRegistration = registration;
    })
    .catch(() => {
      // Service Worker registration failed
    });
}

// Request notification permission and get token
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) {
    throw new Error('Firebase Messaging is not available');
  }
  
  try {
    // Ensure service worker is registered and ready
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        serviceWorkerRegistration = registration;
      } catch {
        // Try to register if not already registered
        if (!serviceWorkerRegistration) {
          serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        }
      }
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission was not granted');
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      throw new Error('Missing VITE_FIREBASE_VAPID_KEY for push notifications. Please add it to your .env file.');
    }

    // Get token with service worker registration
    const tokenOptions: { vapidKey: string; serviceWorkerRegistration?: ServiceWorkerRegistration } = {
      vapidKey,
    };
    
    if (serviceWorkerRegistration) {
      tokenOptions.serviceWorkerRegistration = serviceWorkerRegistration;
    }

    const token = await getToken(messaging, tokenOptions);
    
    if (!token) {
      throw new Error('Failed to get FCM token. Make sure the service worker is properly registered.');
    }

    return token;
  } catch (error) {
    console.error('Error getting notification token:', error);
    throw error;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  const messagingInstance = messaging;
  if (!messagingInstance) return Promise.resolve(null);
  
  return new Promise((resolve) => {
    onMessage(messagingInstance, (payload) => {
      resolve(payload);
    });
  });
};

export default app;

