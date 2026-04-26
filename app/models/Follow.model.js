import mongoose from "mongoose";

const { Schema } = mongoose;

const followSchema = new Schema(
  {
    followerId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    followingId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["following", "requested"],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
followSchema.index({ followingId: 1, status: 1 });
followSchema.index({ followerId: 1, status: 1 });

const Follow = mongoose.models.Follow || mongoose.model("Follow", followSchema);

export default Follow;
