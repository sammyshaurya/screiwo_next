import { NextResponse } from "next/server";
import { connectdb } from "@/app/lib/db";
import { auth } from "@clerk/nextjs/server";
import Feed from "@/app/models/Feed.model";
import Posts from "@/app/models/Posts.model";
import { hydratePostSummaries, POST_SUMMARY_PROJECTION } from "@/app/lib/postData";

export const GET = async () => {
  try {
    await connectdb();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    const feedDocument = await Feed.findOne({ userid: userId }).lean();
    const feedItems = feedDocument?.items || [];
    const orderedPostIds = feedItems.map((item) => item.postId).filter(Boolean);
    const posts = orderedPostIds.length > 0
      ? await Posts.find(
          { _id: { $in: orderedPostIds }, isDeleted: { $ne: true } },
          POST_SUMMARY_PROJECTION
        ).lean()
      : [];

    const postMap = new Map(posts.map((post) => [post._id.toString(), post]));
    const orderedPosts = orderedPostIds
      .map((postId) => postMap.get(postId.toString()))
      .filter(Boolean);
    const hydratedFeed = await hydratePostSummaries(orderedPosts);

    return NextResponse.json(hydratedFeed, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
};
