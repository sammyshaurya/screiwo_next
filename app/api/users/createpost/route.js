import { NextResponse } from "next/server";
import { verifyUser } from "../../middleware/fetchData";
import Profile from "@/app/models/Profile.model";

export const POST = async (req, res) => {
  await verifyUser(req, res);
  const { title, content } = await req.json();
  if (!title || !content) {
    return NextResponse.json("Title and content are required", { status: 401 });
  }

  try {
    const profile = await Profile.findOne({ userid: req.user._id });

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

    await profile.save();
    return NextResponse.json({ message: "Post created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};