import { NextResponse } from "next/server";
import AllPosts from "@/app/models/Posts.model";
import Profile from "@/app/models/Profile.model";
import { connectdb } from "@/app/lib/db";
import { headers } from "next/headers";
import { verifyUser } from "../middleware/fetchData";

export const GET = async (req, res) => {
  await connectdb();
  let token = headers().get('authorizations') || headers().get('authorization');
  let userObj = headers().get('userid');
  let follows = false;

  if (token) {
    await verifyUser(req, res);
    if (!req.verified) {
      return NextResponse.json("Unauthorized access", { status: 401 });
    }
  }

  const postid = req.nextUrl.searchParams.get("postid")?.toString() || null;

  if (!postid) {
    console.error("No postid provided");
    return NextResponse.json({ error: "No postid provided" }, { status: 400 });
  }

  try {
    const posts = await AllPosts.findById(postid);
    if (!posts) {
      console.error("Post not found");
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const author = await Profile.findOne(
      { userid: posts.userid },
      { username: 1, profileType: 1, FirstName: 1, LastName: 1, Bio: 1, Followers: 1, Followings: 1, userid: 1 }
    );
    if (!author) {
      console.error("Author not found");
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    // Check if the user is following the author
    const { FollowingsList } = author;
    
    if (userObj) {
      userObj = JSON.stringify(userObj);
      if (userObj === JSON.stringify(author.userid)) {
        follows = "myself";
      } else {
        follows = FollowingsList.some(id => id.toString() === userObj) || false ;
      }
    }

    const Post = {
      ...posts.toObject(),
      author,
      follows,
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