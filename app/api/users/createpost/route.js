import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import Profile from "@/app/models/Profile.model";
import { FeedUpdate } from "./FeedUpdate";
import { connectdb } from "@/app/lib/db";
import AllPosts from "@/app/models/Posts.model";
import mongoose from "mongoose";
import { buildPostDerivedFields } from "@/app/lib/postData";
import { syncProfileCounters } from "@/app/lib/profileData";
import { normalizeUsername } from "@/app/lib/username";

export const POST = async (req, res) => {
  await connectdb();
  const clerkuser = await currentUser();
  if (!clerkuser) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }

  const { title, content } = await req.json();
  const authorId = clerkuser.id;

  if (!title || !content) {
    return NextResponse.json("Title and content are required", { status: 401 });
  }

  try {
    // Create a new ObjectId
    const postId = new mongoose.Types.ObjectId();
    
    const derivedFields = buildPostDerivedFields(content);
    const newPost = {
      _id: postId, 
      userid: authorId,
      username: normalizeUsername(clerkuser.username),
      title: title,
      content: content,
      ...derivedFields,
      createdAt: new Date(),
      DateofCreation: new Date(),
      profileImageUrl: clerkuser.imageUrl,
    };

    const updatedProfile = await Profile.findOne(
      { userid: authorId },
      { FollowingsList: 1 }
    ).lean();

    if (!updatedProfile) {
      return NextResponse.json("Profile not found", { status: 404 });
    }

    const createdPost = await AllPosts.create(newPost);
    const liveCounts = await syncProfileCounters(authorId);

    await FeedUpdate(authorId, postId, updatedProfile.FollowingsList);

    return NextResponse.json({
      message: "Post created successfully",
      postId,
      postCount: liveCounts?.postCount ?? 0,
      post: createdPost.toObject ? createdPost.toObject() : createdPost,
      profile: {
        ...(updatedProfile.toObject ? updatedProfile.toObject() : updatedProfile),
        ...(liveCounts || {}),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};
