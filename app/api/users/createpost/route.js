import { NextResponse } from "next/server";
import { verifyUser } from "../../middleware/fetchData";
import Profile from "@/app/models/Profile.model";
import { kv } from "@vercel/kv";

export const POST = async (req, res) => {
  await verifyUser(req, res);
  // const user = await kv.get('screiwo');
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
    const newPostId = authorpost.posts[authorpost.posts.length - 1]._id.toString();
    updateFeeds(authorId, newPostId);
    return NextResponse.json({ message: "Post created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};

async function updateFeeds(authorId, postId) {
  const authorProfile = await Profile.findOne({userid: authorId});
  const followers = authorProfile.FollowersList;

  const usersToUpdate = [authorId, ...followers];
  const score = 70;

  for (const userId of usersToUpdate) {
    const postCache = JSON.stringify({ score, value: postId });
    await kv.lpush(`userFeed:${userId}`, postCache);
    const output = await kv.lrange(`userFeed:${userId}`, 0, -1)
  }
}