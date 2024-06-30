import { NextResponse } from "next/server";
import { verifyUser } from "../../middleware/fetchData";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";

export const POST = async (req) => {
  await connectdb();
  await verifyUser(req);
  const postValues = await req.json();
  const userID = postValues.params.followeeid;
  const followUser = postValues.params.followUser;
  try {
    const followerID = userID;
    const followingID = followUser;

    if (followerID === followingID) {
      return NextResponse.json({ message: "Can't follow yourself" }, { status: 204 });
    }

    if (!followerID) {
      return NextResponse.json({ message: "Follower ID is missing" }, { status: 404 });
    }

    if (!followingID) {
      return NextResponse.json({ message: "Following ID is missing" }, { status: 404 });
    }

    // Find the following user
    const followingProfile = await Profile.findOne({userid: followingID}).lean();
    if (!followingProfile) {
      return NextResponse.json({ message: "No user found" }, { status: 404 });
    }

    // Check if already following
    if (followingProfile.FollowersList.includes(followerID)) {
      return NextResponse.json({ message: "Already following this user" }, { status: 202 });
    }

    // Add follower to the following user's FollowersList and increment followersCount
    await Profile.findOneAndUpdate(
      { userid: followingID },
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
        $addToSet: { FollowingsList: followingID },
        $inc: { Followings: 1 }
      },
      { new: true }
    );

    return NextResponse.json("Followed successfully", { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
