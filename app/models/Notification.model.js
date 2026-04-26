import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  fromUserId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'like',
      'comment',
      'reply',
      'follow',
      'follow_request',
      'follow_request_accepted',
      'follow_request_declined',
    ],
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Posts',
    default: null,
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  message: {
    type: String,
    required: true,
  },
  groupKey: {
    type: String,
    default: null,
    index: true,
  },
  entityType: {
    type: String,
    default: null,
  },
  entityId: {
    type: String,
    default: null,
  },
  actorSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  entitySnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
  seenAt: {
    type: Date,
    default: null,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, readAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
