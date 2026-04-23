import { NextResponse } from "next/server"
import Profile from "@/app/models/Profile.model";
import { connectdb } from "@/app/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { getPostsByAuthorId } from "@/app/lib/postData";
import { canViewProfile } from "@/app/lib/profilePrivacy";
import { withLiveProfileCounts } from "@/app/lib/profileData";
import Posts from "@/app/models/Posts.model";
import { normalizeUsername, createUsernameRegex } from "@/app/lib/username";

export const GET = async (req,{params})=> {
  await connectdb();
  const signeduser = await currentUser();
  if (!signeduser) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }
  const user = normalizeUsername(req.nextUrl.searchParams.get('username')) || null;
    try {
        if (!user){
            console.error('No username provided');
            return NextResponse.json("Error", { status: 401 });
          }
        let searchedUsers = await Profile.findOne({ username: createUsernameRegex(user) }).lean();
        if (searchedUsers === null) {
            console.error('No user found');
            return NextResponse.json("No user found", { status: 404 });
          }
        const follower = (searchedUsers.FollowersList || []).some((id) => id?.toString?.() === signeduser.id);
        const requested = (searchedUsers.FollowRequestsReceived || []).some((id) => id?.toString?.() === signeduser.id);
        const canView = canViewProfile(searchedUsers, signeduser.id);
        const postCount = await Posts.countDocuments({ userid: searchedUsers.userid, isDeleted: { $ne: true } });
        if (!canView) {
          return NextResponse.json(
            {
              message: "This profile is private.",
              isPrivate: true,
              userProfile: {
                ...withLiveProfileCounts(searchedUsers, postCount),
                preferences: searchedUsers.preferences || {},
              },
              posts: [],
              isFollowing: follower,
              isRequested: requested,
              relationship: follower ? "following" : requested ? "requested" : "none",
            },
            {
              status: 403,
              headers: {
                "Cache-Control": "no-store",
              },
            }
          );
        }

        const posts = await getPostsByAuthorId(searchedUsers.userid);
        return NextResponse.json(
          { userProfile: withLiveProfileCounts(searchedUsers, posts.length), posts, isFollowing : follower, isRequested: requested, relationship: follower ? "following" : requested ? "requested" : "none" },
          {
            status: 200,
            headers: {
              "Cache-Control": "no-store",
            },
          }
        )
      } catch (error) {
        console.error('Error searching for users:', error);
        return NextResponse.json("Internal Server Error", {status: 500})
      }
}
