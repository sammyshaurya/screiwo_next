import mongoose from "mongoose";

const { Schema } = mongoose;

const followerSchema = new Schema({
  IFollowing: {
    type: String,
    ref: "User",
    required: true,
  },
  IFollower: {
    type: String,
    ref: "User",
    required: true,
  },
  createdat: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model exists, and only define it if it doesn't
const FollowersDB = mongoose.models.FollowersDB || mongoose.model("FollowersDB", followerSchema);
export default FollowersDB;
