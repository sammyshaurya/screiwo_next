import { NextResponse } from "next/server"
import Profile from "@/app/models/Profile.model";
import { connectdb } from "@/app/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const GET = async (req,{params})=> {
  await connectdb();
  const signeduser = await currentUser();
  if (!signeduser) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }
  const user = req.nextUrl.searchParams.get('username') || null;
    try {
        if (!user){
            console.error('No username provided');
            return NextResponse.json("Error", { status: 401 });
          }
        let searchedUsers = await Profile.findOne({ username: user });
        if (searchedUsers === null) {
            console.error('No user found');
            return NextResponse.json("No user found", { status: 404 });
          }
        let follower = false
        if (searchedUsers.FollowersList.includes(signeduser.id)) {
             follower = true
          }
        else {
            follower = false
          }
        return NextResponse.json({userProfile: searchedUsers, isFollowing : follower}, {status: 200})
      } catch (error) {
        console.error('Error searching for users:', error);
        return NextResponse.json("Internal Server Error", {status: 500})
      }
}