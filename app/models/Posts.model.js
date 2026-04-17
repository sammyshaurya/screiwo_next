import mongoose from "mongoose";

const { Schema } = mongoose;

const PostSchema = new Schema({
  userid: {
    type: String,
    ref: "Profile",
    required: true,
  },
  profileImageUrl: {
    type: String,
    default: null,
  },
  username: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  contentText: {
    type: String,
    default: "",
  },
  excerpt: {
    type: String,
    default: "",
  },
  coverImageUrl: {
    type: String,
    default: null,
  },
  previewType: {
    type: String,
    default: "text",
  },
  hasImages: {
    type: Boolean,
    default: false,
  },
  hasLists: {
    type: Boolean,
    default: false,
  },
  hasHeadings: {
    type: Boolean,
    default: false,
  },
  likes: {
    type: Number,
    default: 0,
  },
  commentscount: {
    type: Number,
    default: 0,
  },
  saves: {
    type: Number,
    default: 0,
  },
  // New fields for engagement tracking
  viewsCount: {
    type: Number,
    default: 0,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  DateofCreation: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Indexes for efficient querying
PostSchema.index({ userid: 1, DateofCreation: -1 });
PostSchema.index({ DateofCreation: -1 });
PostSchema.index({ isDeleted: 1, DateofCreation: -1 });
PostSchema.index({ username: 1, DateofCreation: -1 });

const AllPosts = mongoose.models.Posts || mongoose.model("Posts", PostSchema);

export default AllPosts;
