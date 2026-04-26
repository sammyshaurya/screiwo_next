import crypto from 'crypto';
import { connectdb } from '../db.js';
import Notification from '../../models/Notification.model.js';
import NotificationOutbox from '../../models/NotificationOutbox.model.js';

const QUEUE_NAME = 'notification-events';
const DEFAULT_QUEUE_OPTIONS = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: 1000,
  removeOnFail: 1000,
};

let redisConnection = null;
let notificationQueue = null;

function logNotificationEvent(stage, event, extra = {}) {
  console.log("[notification]", stage, {
    eventId: event?.eventId,
    type: event?.type,
    recipientId: event?.recipientId,
    actorId: event?.actorId,
    postId: event?.postId?.toString?.() || event?.postId || null,
    commentId: event?.commentId?.toString?.() || event?.commentId || null,
    groupKey: event?.groupKey || null,
    ...extra,
  });
}

function hasRedis() {
  return Boolean(process.env.REDIS_URL);
}

async function getRedisConnection() {
  if (!hasRedis()) {
    return null;
  }

  if (!redisConnection) {
    const { default: IORedis } = await import('ioredis');
    redisConnection = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  return redisConnection;
}

async function publishNotificationEvent(event) {
  if (!hasRedis() || !event?.recipientId) {
    return;
  }

  try {
    logNotificationEvent("publish:attempt", event);
    const connection = await getRedisConnection();
    if (!connection) {
      return;
    }

    await connection.publish(
      `notifications:${event.recipientId}`,
      JSON.stringify({
        eventId: event.eventId,
        recipientId: event.recipientId,
        type: event.type,
        message: event.message,
        read: false,
        createdAt: event.createdAt,
      })
    );
    logNotificationEvent("publish:sent", event);
  } catch (error) {
    console.error('Failed to publish notification event:', error);
  }
}

export async function getNotificationQueue() {
  if (!hasRedis()) {
    return null;
  }

  if (!notificationQueue) {
    const { Queue } = await import('bullmq');
    notificationQueue = new Queue(QUEUE_NAME, {
      connection: await getRedisConnection(),
      defaultJobOptions: DEFAULT_QUEUE_OPTIONS,
    });
  }

  return notificationQueue;
}

export function buildNotificationEvent(event = {}) {
  const eventId = event.eventId || crypto.randomUUID();
  const createdAt = event.createdAt ? new Date(event.createdAt) : new Date();

  return {
    eventId,
    eventType: event.type,
    recipientId: event.recipientId,
    actorId: event.actorId,
    type: event.type,
    postId: event.postId || null,
    commentId: event.commentId || null,
    message: event.message,
    groupKey: event.groupKey || null,
    entityType: event.entityType || null,
    entityId: event.entityId || null,
    actorSnapshot: event.actorSnapshot || null,
    entitySnapshot: event.entitySnapshot || null,
    createdAt: createdAt.toISOString(),
    read: false,
    readAt: null,
    seenAt: null,
    archivedAt: null,
  };
}

async function persistOutbox(event) {
  await NotificationOutbox.updateOne(
    { eventId: event.eventId },
    {
      $setOnInsert: {
        eventId: event.eventId,
        eventType: event.eventType,
        recipientId: event.recipientId,
        actorId: event.actorId,
        attempts: 0,
      },
      $set: {
        payload: event,
        status: 'pending',
        lastError: null,
        availableAt: new Date(event.createdAt),
      },
    },
    { upsert: true }
  );
}

export async function processNotificationEvent(event) {
  const payload = buildNotificationEvent(event);

  if (!payload.recipientId || !payload.actorId || !payload.type || !payload.message) {
    return null;
  }

  logNotificationEvent("process:start", payload);
  await connectdb();

  const existing = await Notification.findOne({ eventId: payload.eventId }).lean();
  if (existing) {
    logNotificationEvent("process:exists", payload);
    await NotificationOutbox.updateOne(
      { eventId: payload.eventId },
      {
        $set: {
          status: 'processed',
          processedAt: new Date(),
          lastError: null,
        },
      },
      { upsert: true }
    );
    return existing;
  }

  const notification = await Notification.create({
    eventId: payload.eventId,
    userId: payload.recipientId,
    fromUserId: payload.actorId,
    type: payload.type,
    postId: payload.postId,
    commentId: payload.commentId,
    message: payload.message,
    groupKey: payload.groupKey,
    entityType: payload.entityType,
    entityId: payload.entityId,
    actorSnapshot: payload.actorSnapshot,
    entitySnapshot: payload.entitySnapshot,
    read: false,
    readAt: null,
    seenAt: null,
    archivedAt: null,
    createdAt: new Date(payload.createdAt),
  });

  logNotificationEvent("process:created", payload, {
    notificationId: notification?._id?.toString?.() || notification?._id || null,
  });

  await NotificationOutbox.updateOne(
    { eventId: payload.eventId },
    {
      $set: {
        status: 'processed',
        processedAt: new Date(),
        lastError: null,
      },
    },
    { upsert: true }
  );

  await publishNotificationEvent(notification.toObject?.() || payload);

  return notification;
}

export async function enqueueNotificationEvent(event) {
  const payload = buildNotificationEvent(event);

  logNotificationEvent("enqueue:triggered", payload);
  await connectdb();
  await persistOutbox(payload);

  // Write the inbox record immediately so the user sees the notification
  // even if the background worker is delayed or unavailable.
  await processNotificationEvent(payload);

  const queue = await getNotificationQueue();
  if (!queue) {
    return payload;
  }

  try {
    await queue.add('notification.process', payload, {
      jobId: payload.eventId,
    });
    logNotificationEvent("enqueue:queued", payload);
    return payload;
  } catch (error) {
    await NotificationOutbox.updateOne(
      { eventId: payload.eventId },
      {
        $set: {
          status: 'failed',
          lastError: error.message,
        },
        $inc: { attempts: 1 },
      }
    );

    logNotificationEvent("enqueue:fallback", payload, {
      error: error?.message || String(error),
    });

    return payload;
  }
}

export async function cleanupNotificationInbox({
  retentionDays = Number(process.env.NOTIFICATION_RETENTION_DAYS || 45),
  maxPerUser = Number(process.env.NOTIFICATION_MAX_PER_USER || 500),
} = {}) {
  await connectdb();

  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  await Notification.deleteMany({
    read: true,
    readAt: { $lt: cutoff },
  });

  const userIds = await Notification.distinct('userId');

  for (const userId of userIds) {
    const totalCount = await Notification.countDocuments({ userId });
    if (totalCount <= maxPerUser) {
      continue;
    }

    const overflow = totalCount - maxPerUser;
    const deletable = await Notification.find({ userId, read: true })
      .sort({ createdAt: 1 })
      .limit(overflow)
      .select({ _id: 1 })
      .lean();

    if (deletable.length) {
      await Notification.deleteMany({
        _id: { $in: deletable.map((item) => item._id) },
      });
    }
  }
}
