import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeFirebaseAdmin } from './config/firebase.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import logsRoutes from './routes/logs.js';
import analyticsRoutes from './routes/analytics.js';
import notificationRoutes from './routes/notifications.js';
import { checkAndSendJITAIs } from './scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase Admin
initializeFirebaseAdmin();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'QuitWise Backend API' });
});

// Schedule JITAI checks every 15 minutes (only for local development)
// On Vercel, use Cron Jobs to call /api/notifications/check-jitais endpoint
if (process.env.VERCEL !== '1') {
  const JITAI_CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes

  setInterval(async () => {
    try {
      await checkAndSendJITAIs();
    } catch (error) {
      console.error('Error in scheduled JITAI check:', error);
    }
  }, JITAI_CHECK_INTERVAL);

  // Run initial check after 1 minute (to allow server to start)
  setTimeout(async () => {
    try {
      await checkAndSendJITAIs();
    } catch (error) {
      console.error('Error in initial JITAI check:', error);
    }
  }, 60000);
}

// Export app for Vercel serverless functions
export default app;

// Only start server if running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    // Server started
  });
}

