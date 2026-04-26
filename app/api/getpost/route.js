import { NextResponse } from "next/server";
import AllPosts from "@/app/models/Posts.model";
import Profile from "@/app/models/Profile.model";
import { connectdb } from "@/app/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { toProfileSummary } from "@/app/lib/profileData";
import { canViewProfile, canCommentOnPost } from "@/app/lib/profilePrivacy";

export const GET = async (req, res) => {
  await connectdb();
  let follows = false;
  const signeduser = await currentUser();
  if (!signeduser) {
      return NextResponse.json("Unauthorized access", { status: 401 });
  }
  const userObj = signeduser.id;

  const postid = req.nextUrl.searchParams.get("postid")?.toString() || null;
  const countView = req.nextUrl.searchParams.get("countView") !== "0";

  if (!postid) {
    console.error("No postid provided");
    return NextResponse.json({ error: "No postid provided" }, { status: 400 });
  }

  try {
    const posts = await AllPosts.findOne(
      { _id: postid, isDeleted: { $ne: true } }
    );
    if (!posts) {
      console.error("Post not found");
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const author = await Profile.findOne(
      { userid: posts.userid },
      { username: 1, profileType: 1, FirstName: 1, LastName: 1, Bio: 1, Followers: 1, Followings: 1, FollowersList: 1, FollowingsList: 1, userid: 1, profileImageUrl: 1, preferences: 1 }
    ).lean();
    if (!author) {
      console.error("Author not found");
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    if (!canViewProfile(author, userObj)) {
      return NextResponse.json(
        { error: "This profile is private." },
        { status: 403 }
      );
    }

    if (countView) {
      await AllPosts.findByIdAndUpdate(
        postid,
        { $inc: { viewsCount: 1 } },
        { returnDocument: 'after' }
      );
    }

    if (userObj) {
      if (userObj === author.userid) {
        follows = "myself";
      } else {
        follows = (author.FollowersList || []).some((id) => id.toString() === userObj) || false;
      }
    }

    const Post = {
      ...posts.toObject(),
      author: toProfileSummary(author),
      follows,
      allowComments: canCommentOnPost(author, userObj),
      profileVisibility: author.preferences?.profileVisibility || "public",
    };

    return NextResponse.json(Post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
