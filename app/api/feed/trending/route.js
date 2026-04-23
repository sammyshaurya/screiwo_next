import { NextResponse } from "next/server";
import { connectdb } from "@/app/lib/db";
import { auth } from "@clerk/nextjs/server";
import Posts from "@/app/models/Posts.model";
import { hydratePostSummaries, POST_SUMMARY_PROJECTION } from "@/app/lib/postData";
import { scoreTrendingPost } from "@/app/lib/homeData";

export const GET = async (req) => {
  try {
    await connectdb();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const recentPosts = await Posts.find(
      { isDeleted: { $ne: true } },
      POST_SUMMARY_PROJECTION
    )
      .sort({ DateofCreation: -1, createdAt: -1 })
      .limit(120)
      .lean();

    const rankedPosts = [...recentPosts]
      .map((post) => ({ post, score: scoreTrendingPost(post) }))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.post)
      .slice(skip, skip + limit);

    return NextResponse.json(
      {
        success: true,
        posts: await hydratePostSummaries(rankedPosts),
        pagination: {
          page,
          limit,
          total: recentPosts.length,
          pages: Math.ceil(recentPosts.length / limit),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching trending feed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
};
