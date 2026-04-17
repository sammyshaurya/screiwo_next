import mongoose from "mongoose";

const { Schema } = mongoose;

const FeedItemSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Posts",
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  source: {
    type: String,
    default: "following",
  },
  rankReason: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const FeedSchema = new Schema({
  userid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  items: {
    type: [FeedItemSchema],
    default: [],
  },
});

FeedSchema.index({ userid: 1, "items.createdAt": -1 });
FeedSchema.index({ userid: 1, "items.score": -1, "items.createdAt": -1 });

const Feed = mongoose.models.Feed || mongoose.model("Feed", FeedSchema);

export default Feed;
