import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";
import { normalizeUsername, createUsernameRegex } from "@/app/lib/username";
import { getFollowRelationshipState } from "@/app/lib/followService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = async (req) => {
  await connectdb();

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }

  const username = normalizeUsername(req.nextUrl.searchParams.get("username"));
  const followUser = req.nextUrl.searchParams.get("followUser")?.toString?.() || null;

  if (!username && !followUser) {
    return NextResponse.json(
      { message: "username or followUser is required" },
      { status: 400 }
    );
  }

  const targetProfile = username
    ? await Profile.findOne({ username: createUsernameRegex(username) }).lean()
    : await Profile.findOne({ userid: followUser }).lean();

  if (!targetProfile) {
    return NextResponse.json({ message: "No user found" }, { status: 404 });
  }

  const state = await getFollowRelationshipState({
    viewerId: userId,
    targetId: targetProfile.userid,
  });

  return NextResponse.json(
    {
      ...state,
      userProfile: targetProfile,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
};
