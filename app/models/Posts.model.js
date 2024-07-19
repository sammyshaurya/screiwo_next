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
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  postcount: {
    type: Number,
    default: 0,
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
  DateofCreation: {
    type: Date,
    default: Date.now,
  },
});

const AllPosts = mongoose.models.Posts || mongoose.model("Posts", PostSchema);

export default AllPosts;