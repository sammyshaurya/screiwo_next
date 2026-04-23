import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";
import Posts from "@/app/models/Posts.model";
import Notification from "@/app/models/Notification.model";
import { toProfileSummary } from "@/app/lib/profileData";
import { buildTrendingTopics } from "@/app/lib/homeData";

export const GET = async () => {
  try {
    await connectdb();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const profile = await Profile.findOne(
      { userid: userId },
      {
        userid: 1,
        username: 1,
        FirstName: 1,
        LastName: 1,
        profileImageUrl: 1,
        FollowersList: 1,
        FollowingsList: 1,
        FollowRequestsReceived: 1,
        postCount: 1,
      }
    ).lean();

    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    const unreadNotifications = await Notification.countDocuments({ userId, read: false });
    const readsResult = await Posts.aggregate([
      { $match: { userid: userId, isDeleted: { $ne: true } } },
      { $group: { _id: null, totalReads: { $sum: "$viewsCount" } } },
    ]);

    const suggestedProfiles = await Profile.find(
      {
        userid: { $ne: userId, $nin: profile.FollowingsList || [] },
        "preferences.profileVisibility": "public",
      },
      {
        userid: 1,
        username: 1,
        FirstName: 1,
        LastName: 1,
        profileImageUrl: 1,
        Bio: 1,
        Followers: 1,
        Followings: 1,
        postCount: 1,
        preferences: 1,
      }
    )
      .sort({ Followers: -1, postCount: -1, createdAt: -1 })
      .limit(6)
      .lean();

    const recentPosts = await Posts.find(
      { isDeleted: { $ne: true } },
      { title: 1, contentText: 1, excerpt: 1 }
    )
      .sort({ likes: -1, commentscount: -1, viewsCount: -1 })
      .limit(60)
      .lean();

    return NextResponse.json(
      {
        success: true,
        stats: {
          posts: profile.postCount || 0,
          followers: (profile.FollowersList || []).length,
          following: (profile.FollowingsList || []).length,
          reads: readsResult[0]?.totalReads || 0,
          requests: (profile.FollowRequestsReceived || []).length,
          unreadNotifications,
        },
        suggestedCreators: suggestedProfiles.map((item) => ({
          ...toProfileSummary(item),
          isPrivate: item?.preferences?.profileVisibility === "private",
        })),
        trendingTopics: buildTrendingTopics(recentPosts, 8),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching home overview:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
