import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['post_view', 'post_like', 'post_comment', 'post_bookmark', 'user_follow'],
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Posts',
    default: null,
  },
  targetUserId: {
    type: String,
    default: null,
  },
  score: {
    type: Number,
    default: function() {
      const scores = {
        post_view: 1,
        post_like: 5,
        post_comment: 10,
        post_bookmark: 15,
        user_follow: 20,
      };
      return scores[this.type] || 1;
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ userId: 1, type: 1 });
ActivitySchema.index({ postId: 1, type: 1 });
ActivitySchema.index({ userId: 1, score: -1, createdAt: -1 });

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
