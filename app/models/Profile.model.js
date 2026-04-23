import mongoose from "mongoose";

const { Schema } = mongoose;

const ProfileSchema = new Schema({
  userid: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  profileImageUrl: {
    type: String,
    default: null
  },
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  Followers: {
    type: Number,
    default: 0,
  },
  Followings: {
    type: Number,
    default: 0,
  },
  FollowersList: {
    type: [{ type: String, ref: 'Profile' }],
    default: [],
  },
  FollowingsList: {
    type: [{ type: String, ref: 'Profile' }],
    default: [],
  },
  FollowRequestsReceived: {
    type: [{ type: String, ref: 'Profile' }],
    default: [],
  },
  FollowRequestsSent: {
    type: [{ type: String, ref: 'Profile' }],
    default: [],
  },
  Bio: {
    type: String,
    default: "I am using Screiwo",
  },
  website: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  dob: {
    type: String,
    required: true,
  },
  profileType: {
    type: String,
    required: true,
  },
  postCount: {
    type: Number,
    default: 0,
  },
  gender: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  preferences: {
    profileVisibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
    likeNotifications: {
      type: Boolean,
      default: true,
    },
    commentNotifications: {
      type: Boolean,
      default: true,
    },
    followNotifications: {
      type: Boolean,
      default: true,
    },
    emailDigest: {
      type: Boolean,
      default: false,
    },
    compactMode: {
      type: Boolean,
      default: false,
    },
    hideMediaPreviews: {
      type: Boolean,
      default: false,
    },
  },
}, { timestamps: true });

ProfileSchema.virtual("postsCount").get(function postsCount() {
  return this.postCount || 0;
});

ProfileSchema.index({ userid: 1 }, { unique: true });
ProfileSchema.index({ username: 1 }, { unique: true });

const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
export default Profile;
