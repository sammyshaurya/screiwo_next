import { NextResponse } from "next/server";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";
import Feed from "@/app/models/Feed.model";
import { FeedFromFollow } from "../../users/createpost/FeedUpdate";
import { currentUser } from "@clerk/nextjs/server";
import { syncProfileCounters } from "@/app/lib/profileData";

function isPrivateProfile(profile) {
  return profile?.preferences?.profileVisibility === "private";
}

function isFollower(profile, userId) {
  return Boolean(profile?.FollowersList?.some((id) => id?.toString?.() === userId));
}

function isPending(profile, userId) {
  return Boolean(profile?.FollowRequestsReceived?.some((id) => id?.toString?.() === userId));
}

async function syncFollowCounts(userId) {
  const profile = await Profile.findOne(
    { userid: userId },
    { FollowersList: 1, FollowingsList: 1 }
  ).lean();

  if (!profile) {
    return;
  }

  await Profile.updateOne(
    { userid: userId },
    {
      $set: {
        Followers: (profile.FollowersList || []).length,
        Followings: (profile.FollowingsList || []).length,
      },
    }
  );
}

async function getProfileSnapshot(userid) {
  return Profile.findOne(
    { userid },
    {
      username: 1,
      profileImageUrl: 1,
      FirstName: 1,
      LastName: 1,
      Followers: 1,
      Followings: 1,
      FollowersList: 1,
      FollowingsList: 1,
      FollowRequestsReceived: 1,
      FollowRequestsSent: 1,
      Bio: 1,
      website: 1,
      location: 1,
      dob: 1,
      profileType: 1,
      gender: 1,
      mobile: 1,
      preferences: 1,
      postCount: 1,
    }
  ).lean();
}

async function removeFeedEntries(followerId, authorId) {
  await Feed.updateOne(
    { userid: followerId },
    {
      $pull: {
        items: { authorId },
      },
    }
  );
}

export const POST = async (req) => {
  await connectdb();
  const signeduser = await currentUser();
  if (!signeduser) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }

  const headers = await req.json();
  const followUser = headers.followUser;

  try {
    const followerID = signeduser.id.toString();
    const followeeID = followUser?.toString?.();

    if (!followeeID) {
      return NextResponse.json({ message: "Following ID is missing" }, { status: 404 });
    }

    if (followerID === followeeID) {
      return NextResponse.json({ message: "Can't follow yourself" }, { status: 202 });
    }

    const followingProfile = await Profile.findOne({ userid: followeeID });
    const followerProfile = await Profile.findOne({ userid: followerID });

    if (!followingProfile || !followerProfile) {
      return NextResponse.json({ message: "No user found" }, { status: 404 });
    }

    const alreadyFollowing = isFollower(followingProfile, followerID);
    const alreadyRequested = isPending(followingProfile, followerID);

    if (alreadyFollowing) {
      return NextResponse.json(
        { message: "Already following this user", relationship: "following" },
        { status: 202 }
      );
    }

    if (alreadyRequested) {
      return NextResponse.json(
        { message: "Request already pending", relationship: "requested" },
        { status: 202 }
      );
    }

    const privateProfile = isPrivateProfile(followingProfile);

    if (privateProfile) {
      await Profile.findOneAndUpdate(
        { userid: followeeID },
        {
          $addToSet: { FollowRequestsReceived: followerID },
        }
      );

      await Profile.findOneAndUpdate(
        { userid: followerID },
        {
          $addToSet: { FollowRequestsSent: followeeID },
        }
      );

      return NextResponse.json(
        { message: "Follow request sent", relationship: "requested" },
        { status: 202 }
      );
    }

    await Profile.findOneAndUpdate(
      { userid: followeeID },
      {
        $addToSet: { FollowersList: followerID },
      },
      { new: true }
    );

    await Profile.findOneAndUpdate(
      { userid: followerID },
      {
        $addToSet: { FollowingsList: followeeID },
      },
      { new: true }
    );

    await syncFollowCounts(followeeID);
    await syncFollowCounts(followerID);
    await syncProfileCounters(followeeID);
    await syncProfileCounters(followerID);

    await FeedFromFollow(followerID, followeeID, followingProfile.username);

    const actorProfile = await getProfileSnapshot(followerID);
    const targetProfile = await getProfileSnapshot(followeeID);

    return NextResponse.json(
      { message: "Followed successfully", relationship: "following", actorProfile, targetProfile },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};

export const DELETE = async (req) => {
  await connectdb();
  const signeduser = await currentUser();
  if (!signeduser) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }

  const followUser = req.nextUrl.searchParams.get("followUser");

  try {
    const followerID = signeduser.id.toString();
    const followeeID = followUser?.toString?.();

    if (!followeeID) {
      return NextResponse.json({ message: "Following ID is missing" }, { status: 404 });
    }

    if (followerID === followeeID) {
      return NextResponse.json({ message: "Can't unfollow yourself" }, { status: 202 });
    }

    const followingProfile = await Profile.findOne({ userid: followeeID });
    const followerProfile = await Profile.findOne({ userid: followerID });

    if (!followingProfile || !followerProfile) {
      return NextResponse.json({ message: "No user found" }, { status: 404 });
    }

    const isFollowing = isFollower(followingProfile, followerID);
    const isPendingRequest = isPending(followingProfile, followerID);

    if (!isFollowing && !isPendingRequest) {
      return NextResponse.json(
        { message: "No existing follow relationship", relationship: "none" },
        { status: 202 }
      );
    }

    if (isFollowing) {
      await Profile.findOneAndUpdate(
        { userid: followeeID },
        {
          $pull: { FollowersList: followerID },
        }
      );

      await Profile.findOneAndUpdate(
        { userid: followerID },
        {
          $pull: { FollowingsList: followeeID },
        }
      );

      await Profile.findOneAndUpdate(
        { userid: followeeID },
        {
          $pull: { FollowRequestsReceived: followerID },
        }
      );

      await Profile.findOneAndUpdate(
        { userid: followerID },
        {
          $pull: { FollowRequestsSent: followeeID },
        }
      );

      await syncFollowCounts(followeeID);
      await syncFollowCounts(followerID);
      await syncProfileCounters(followeeID);
      await syncProfileCounters(followerID);

      await removeFeedEntries(followerID, followeeID);

      return NextResponse.json(
        { message: "Unfollowed successfully", relationship: "none" },
        { status: 200 }
      );
    }

    await Profile.findOneAndUpdate(
      { userid: followeeID },
      {
        $pull: { FollowRequestsReceived: followerID },
      }
    );

    await Profile.findOneAndUpdate(
      { userid: followerID },
      {
        $pull: { FollowRequestsSent: followeeID },
      }
    );

    await syncFollowCounts(followeeID);
    await syncFollowCounts(followerID);
    await syncProfileCounters(followeeID);
    await syncProfileCounters(followerID);

    const actorProfile = await getProfileSnapshot(followerID);
    const targetProfile = await getProfileSnapshot(followeeID);

    return NextResponse.json(
      { message: "Follow request canceled", relationship: "none", actorProfile, targetProfile },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
