import dotenv from 'dotenv';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processNotificationEvent, cleanupNotificationInbox } from '../app/lib/notifications/pipeline.js';
import NotificationOutbox from '../app/models/NotificationOutbox.model.js';
import { connectdb } from '../app/lib/db.js';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('REDIS_URL is required to run the notification worker.');
  process.exit(1);
}

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

await connectdb();

const worker = new Worker(
  'notification-events',
  async (job) => {
    const payload = job.data || {};

    await NotificationOutbox.updateOne(
      { eventId: payload.eventId },
      {
        $set: {
          status: 'processing',
          lastError: null,
        },
        $inc: { attempts: 1 },
      },
      { upsert: true }
    );

    await processNotificationEvent(payload);
    return { processed: true };
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on('completed', async () => {
  await cleanupNotificationInbox();
});

worker.on('failed', async (job, error) => {
  if (job?.data?.eventId) {
    await NotificationOutbox.updateOne(
      { eventId: job.data.eventId },
      {
        $set: {
          status: 'failed',
          lastError: error?.message || 'Unknown error',
        },
      }
    );
  }
});

process.on('SIGINT', async () => {
  await worker.close();
  await connection.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await worker.close();
  await connection.quit();
  process.exit(0);
});
