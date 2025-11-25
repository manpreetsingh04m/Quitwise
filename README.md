# QuitWise

A behavioral-change app that reduces smoking and vaping by combining psychological principles (CBT, conditioning, motivational interviewing) and behavioral economics (nudges, loss aversion, commitment devices).

## Project Structure

```
/
├── client/          # React frontend application
├── backend/         # Node.js/Express backend API
└── README.md
```

## Features

### Core Features
1. **Enhanced Onboarding & Assessment**
   - Psychological profile (triggers, moods, motivation)
   - Economic profile (costs, financial goals)
   - Personalized quit goal and risk profile

2. **Daily Log & Craving Tracker**
   - Log uses, cravings, and resistance
   - Track moods, triggers, and intensity
   - Real-time cost calculations

3. **JITAI (Just-in-Time Adaptive Interventions)**
   - Personalized interventions based on risk windows
   - Breathing exercises, CBT prompts, economic nudges

4. **CBT & Psychoeducation Library**
   - Short lessons on nicotine addiction
   - Cognitive distortion awareness
   - Habit loop understanding
   - Urge surfing techniques

5. **Economic Dashboard**
   - Real-time savings tracking
   - Long-term projections
   - Financial goal progress
   - Behavioral nudges

6. **Commitment & Rewards System**
   - Commitment contracts with stakes
   - Badge achievements
   - Token rewards
   - Self-rewards system

7. **Community & Support**
   - Anonymous discussion groups
   - Stage-based communities
   - Peer support

## Setup

### Client Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase configuration
```

4. Run development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase Admin SDK credentials
```

4. Run development server:
```bash
npm run dev
```

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com

2. Enable the following services:
   - Authentication (Anonymous auth)
   - Firestore Database
   - Cloud Messaging (for push notifications)

3. Get your Firebase config:
   - Go to Project Settings > General
   - Copy the Firebase configuration
   - Add to `client/.env`

4. Set up Firebase Admin SDK:
   - Go to Project Settings > Service Accounts
   - Generate a new private key
   - Add credentials to `backend/.env`

### Push Notifications (Firebase Cloud Messaging)

1. In Firebase Console, open **Project Settings → Cloud Messaging** and generate a Web Push certificate. Copy the VAPID key into `client/.env` as `VITE_FIREBASE_VAPID_KEY`.
2. Enable Cloud Messaging API for the project (done automatically for most new projects).
3. The app requests notification permission on load. Approve the browser prompt to receive JITAI notifications.
4. For testing, trigger `requestNotificationPermission()` from the console if you need to re-request permission.
5. Notifications are sent when:
   - The browser has granted notification permission and returned a valid FCM token.
   - A JITAI has been generated (based on log patterns) and its scheduled time is reached.
   - The backend/cloud function responsible for sending the push uses the saved FCM token.

## Firestore Collections

The app uses the following Firestore collections:

- `users` - User profiles and assessment data
- `logs` - Daily log entries (uses, cravings, resistance)
- `cbtLessons` - CBT library content
- `communityPosts` - Community discussion posts
- `commitmentContracts` - User commitment contracts
- `jitais` - Scheduled interventions

## Technologies

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Firebase SDK
- React Router

### Backend
- Node.js
- Express
- Firebase Admin SDK

## Development

### Running Both Client and Backend

In separate terminals:

```bash
# Terminal 1 - Client
cd client
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

## Building for Production

### Client
```bash
cd client
npm run build
```

### Backend
```bash
cd backend
npm start
```

## License

This project is for educational purposes.
