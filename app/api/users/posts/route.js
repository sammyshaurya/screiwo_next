import { NextResponse } from "next/server";
import { verifyUser } from "../../middleware/fetchData";
import Profile from "@/app/models/Profile.model";
import { connectdb } from "@/app/lib/db";

export const GET = async (req) => {
  await connectdb()
  await verifyUser(req);
  if (!req.verified) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }
    try {
    const userId = req.user._id.toString();
    const profile = await Profile.findOne({ userid: userId });
    

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    const userPosts = profile.posts;

    return NextResponse.json({ userPosts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
