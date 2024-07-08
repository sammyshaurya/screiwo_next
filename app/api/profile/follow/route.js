import { NextResponse } from "next/server";
import { verifyUser } from "../../middleware/fetchData";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";
import { FeedFromFollow } from "../../users/createpost/FeedUpdate";

export const POST = async (req) => {
  await connectdb();
  await verifyUser(req);
  if (!req.verified) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }
  const postValues = await req.json();
  const userID = postValues.followeeid;
  const followUser = postValues.followUser;
  try {
    const followerID = userID.toString();
    const followeeID = followUser.toString();

    if (followerID === followeeID) {
      return NextResponse.json({ message: "Can't follow yourself" }, { status: 204 });
    }

    if (!followerID) {
      return NextResponse.json({ message: "Follower ID is missing" }, { status: 404 });
    }

    if (!followeeID) {
      return NextResponse.json({ message: "Following ID is missing" }, { status: 404 });
    }

    // Find the following user
    const followingProfile = await Profile.findOne({ userid: followeeID }).lean();
    if (!followingProfile) {
      return NextResponse.json({ message: "No user found" }, { status: 404 });
    }

    // Check if already following
    const isAlreadyFollowing = followingProfile.FollowersList.some(id => id.toString() === followerID);
    FeedFromFollow(followerID, followeeID);

    if (isAlreadyFollowing) {
      return NextResponse.json("Already following this user", { status: 202 });
    }

    await Profile.findOneAndUpdate(
      { userid: followeeID },
      {
        $addToSet: { FollowersList: followerID },
        $inc: { Followers: 1 }
      },
      { new: true }
    );

    // Add following user to the follower's FollowingsList
    await Profile.findOneAndUpdate(
      { userid: followerID },
      {
        $addToSet: { FollowingsList: followeeID },
        $inc: { Followings: 1 }
      },
      { new: true }
    );

    

    return NextResponse.json("Followed successfully", { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
