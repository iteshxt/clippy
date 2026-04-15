import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pasteRoutes from './routes/paste.js';
import { fingerprintMiddleware } from './middleware/fingerprint.js';

dotenv.config();

const app = express();
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Parse CORS origins (supports comma-separated values)
const corsOrigins = CORS_ORIGIN.split(',').map(origin => origin.trim());

// Middleware
app.use(cors({ 
  origin: (origin, callback) => {
    // 1. Always allow if no origin (mobile/curl)
    if (!origin) return callback(null, true);
    
    // 2. Stronger wildcard check (handles '*' anywhere in the list)
    if (corsOrigins.includes('*')) return callback(null, true);

    // 3. Standard whitelist check
    if (corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(fingerprintMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', pasteRoutes);

// Error handling
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File exceeds maximum allowed size.' });
  }
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
