import { NextResponse } from "next/server";
import { verifyUser } from "../../middleware/fetchData";
import Profile from "@/app/models/Profile.model";
import { FeedUpdate } from "./FeedUpdate";
import { connectdb } from "@/app/lib/db";
import AllPosts from "@/app/models/Posts.model";
import mongoose from "mongoose";
import DOMPurify from "isomorphic-dompurify";

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
    // Create a new ObjectId
    const postId = new mongoose.Types.ObjectId();
    
    const newPost = {
      _id: postId, 
      userid: authorId,
      title: title,
      content: content,
      createdAt: new Date(),
    };
    console.log(newPost.content);

    // Update the profile with the new post
    const updatedProfile = await Profile.findOneAndUpdate(
      { userid: authorId },
      {
        $push: {
          posts: {
            $each: [newPost],
            $position: 0,
          },
        },
      },
      { new: true, projection: { FollowingsList: 1 } }
    );

    if (!updatedProfile) {
      return NextResponse.json("Profile not found", { status: 404 });
    }

    // Create the post in AllPosts with the same _id
    const post = await AllPosts.create(newPost);


    // Update the feed
    FeedUpdate(authorId, req.user.username, newPost, updatedProfile.FollowingsList);

    return NextResponse.json({ message: "Post created successfully", FollowingsList: updatedProfile.FollowingsList }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};
