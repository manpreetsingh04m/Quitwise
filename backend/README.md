# QuitWise Backend

Backend API for QuitWise application using Node.js, Express, and Firebase Admin SDK.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Generate a service account key
   - Copy `.env.example` to `.env` and fill in your Firebase credentials

3. Run the server:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### Auth
- `POST /api/auth/verify` - Verify Firebase ID token

### Users
- `GET /api/users/:uid` - Get user profile
- `POST /api/users/:uid` - Create or update user profile

### Logs
- `GET /api/logs/:uid` - Get user logs
- `POST /api/logs/:uid` - Create a new log entry

### Analytics
- `GET /api/analytics/:uid` - Get user analytics

