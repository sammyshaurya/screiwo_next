import { NextResponse } from "next/server";
import { verifyUser } from "../../middleware/fetchData";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";
import FollowersDB from "@/app/models/Followers.model";

export const GET = async (req,res) => {
    await connectdb();
    await verifyUser(req,res);
    try {
        const followUser = req.nextUrl.searchParams.get('followUser')
        const follower = req.user._id;
        const following = followUser;
        if (follower === following) {
          return NextResponse.json({ message: "Can't follow yourself" }, { status: 400 });
        }
  
        if (!follower) {
          return NextResponse.json({ message: "Follower ID is missing" }, { status: 400 });
        }
  
        if (!following) {
          return NextResponse.json({ message: "Following ID is missing" }, { status: 400 });
        }
  
        const follow = await FollowersDB.findOne({
          IFollower: follower,
          IFollowing: following,
        });
  
        if (follow) {
          return NextResponse.json({ message: "Already following" }, { status: 200 });
        } else {
          const newFollow = new FollowersDB({
            IFollower: follower,
            IFollowing: following,
          });
          await newFollow.save();
          const filter = { userid: follower };
          const updateOperation = { $inc: { Followers: 1 } };
  
          Profile.updateOne(filter, updateOperation)
            .then((result) => {
              if (result.nModified > 0) {
                console.log("Update successful:", result);
              } else {
                console.log("No document matched the filter.");
              }
            })
            .catch((error) => {
              console.error("Update failed:", error);
            });
  
          return NextResponse.json({ message: "Followed successfully" }, { status: 201 });
        }
      } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
      }
}