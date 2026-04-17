import mongoose from "mongoose";

const { Schema } = mongoose;

const FeedItemSchema = new Schema({
  feed: {
    type: Schema.Types.Mixed,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

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

const Feed = mongoose.models.Feed || mongoose.model("Feed", FeedSchema);

export default Feed;
