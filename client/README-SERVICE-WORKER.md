# Service Worker Setup

The Firebase service worker is generated at build time from environment variables to avoid committing sensitive credentials.

## Setup

1. Create a `.env` file in the `client` directory with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

2. The service worker will be automatically generated when you run:
   - `npm run dev` (development)
   - `npm run build` (production)

## Files

- `public/firebase-messaging-sw.template.js` - Template file (safe to commit)
- `public/firebase-messaging-sw.js` - Generated file (DO NOT commit - in .gitignore)

## Important

- Never commit `firebase-messaging-sw.js` to git
- Always use the template file for version control
- The generated file is automatically created from environment variables

