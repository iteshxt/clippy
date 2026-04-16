import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
import { startCronJobs } from './cron/cleanup.js';

dotenv.config();

const PORT = process.env.BACKEND_PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  dbName: 'clippy',
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✓ MongoDB connected successfully');
    startCronJobs(); // start the cleanup cron right after database connection
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });
