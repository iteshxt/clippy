import cron from 'node-cron';
import { Paste } from '../models/Paste.js';

// Run sweep every minute (* * * * *)
export const startCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Find and delete all pastes where expiresAt is in the past
      const result = await Paste.deleteMany({ expiresAt: { $lte: now } });
      
      if (result.deletedCount > 0) {
        console.log(`[CRON] Swept and deleted ${result.deletedCount} expired paste(s).`);
      }
    } catch (error) {
      console.error('[CRON] Error sweeping expired pastes:', error.message);
    }
  });

  console.log('✓ Cleanup cron job initialized (runs every 1 minute).');
};
