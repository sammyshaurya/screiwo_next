import { NextResponse } from "next/server";
import { verifyUser } from "../../middleware/fetchData";
import Profile from "@/app/models/Profile.model";
import {FeedUpdate} from "./FeedUpdate";
import { connectdb } from "@/app/lib/db";
import AllPosts from "@/app/models/Posts.model";

export const POST = async (req, res) => {
  await connectdb();
  await verifyUser(req, res);
  if (!req.verified) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }
  const { title, content } = await req.json();
  const authorId = req.user._id.toString();

  if (!title || !content) {
    return NextResponse.json("Title and content are required", { status: 401 });
  }

  try {
    const profile = await Profile.findOne({ userid: authorId });

    if (!profile) {
      return NextResponse.json("Profile not found", { status: 404 });
    }

    // Create the new post
    const newPost = {
      userid: req.user._id,
      title: title,
      content: content,
      createdAt: new Date(),
    };
    profile.posts.push(newPost);
    const authorpost = await profile.save();
    
    const feedpost = authorpost.posts[authorpost.posts.length - 1]
    await AllPosts.create(newPost)

    FeedUpdate(authorId, req.user.username, feedpost, authorpost.FollowingsList);

    return NextResponse.json({ message: "Post created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};
