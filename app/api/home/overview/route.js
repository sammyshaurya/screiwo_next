import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";
import Posts from "@/app/models/Posts.model";
import Notification from "@/app/models/Notification.model";
import Follow from "@/app/models/Follow.model";
import { getLiveProfileCounts, toProfileSummary } from "@/app/lib/profileData";
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
    const [liveCounts, followingRelations, requestRelations] = await Promise.all([
      getLiveProfileCounts(profile, profile.postCount),
      Follow.find({ followerId: userId, status: "following" }, { followingId: 1 }).lean(),
      Follow.find({ followingId: userId, status: "requested" }, { followerId: 1 }).lean(),
    ]);
    const readsResult = await Posts.aggregate([
      { $match: { userid: userId, isDeleted: { $ne: true } } },
      { $group: { _id: null, totalReads: { $sum: "$viewsCount" } } },
    ]);
    const followingIds = followingRelations.map((relation) => relation.followingId);

    const suggestedProfiles = await Profile.find(
      {
        userid: { $ne: userId, $nin: followingIds },
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
          posts: liveCounts.postCount || 0,
          followers: liveCounts.Followers || 0,
          following: liveCounts.Followings || 0,
          reads: readsResult[0]?.totalReads || 0,
          requests: requestRelations.length,
          unreadNotifications,
        },
        suggestedCreators: await Promise.all(
          suggestedProfiles.map(async (item) => ({
            ...(await toProfileSummary(item)),
            isPrivate: item?.preferences?.profileVisibility === "private",
          }))
        ),
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
