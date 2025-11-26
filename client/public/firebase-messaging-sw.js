// Service Worker for Firebase Cloud Messaging
// This file must be in the public folder

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyCCDj0DLvffj-DA7e5pvfZhH7igHwQGvvw",
  authDomain: "quitwise-45b2e.firebaseapp.com",
  projectId: "quitwise-45b2e",
  storageBucket: "quitwise-45b2e.firebasestorage.app",
  messagingSenderId: "727662575616",
  appId: "1:727662575616:web:caddf493d2090fddc298e5",
  measurementId: "G-WD8WZ62ZDD"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'QuitWise';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/vite.svg', // You can add a custom icon
    badge: '/vite.svg',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

