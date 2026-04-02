import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import pasteRoutes from './routes/paste.js';
import { fingerprintMiddleware } from './middleware/fingerprint.js';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Parse CORS origins (supports comma-separated values)
const corsOrigins = CORS_ORIGIN.split(',').map(origin => origin.trim());

// Middleware
app.use(cors({ 
  origin: (origin, callback) => {
    // 1. Allow for mobile/curl where no origin header is provided
    if (!origin) return callback(null, true);
    
    // 2. Allow everything if wildcard is specified (useful for public dev/prod)
    if (CORS_ORIGIN === '*') return callback(null, true);

    // 3. Normal whitelist check
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

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  dbName: 'clippy',
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✓ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
