import { NextResponse } from "next/server";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";
import { auth } from "@clerk/nextjs/server";
import { normalizeUsername, createUsernameRegex } from "@/app/lib/username";
import { isPrivateProfile, isProfileOwner } from "@/app/lib/profilePrivacy";
import { getFollowingsForUser } from "@/app/lib/followService";

export const GET = async (req) => {
  await connectdb();
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }

  const username = normalizeUsername(req.nextUrl.searchParams.get("username"));
  const targetProfile = username
    ? await Profile.findOne({ username: createUsernameRegex(username) }, { preferences: 1, userid: 1 }).lean()
    : await Profile.findOne({ userid: userId }, { preferences: 1, userid: 1 }).lean();

  if (!targetProfile) {
    return NextResponse.json([], { status: 200 });
  }

  if (isPrivateProfile(targetProfile) && !isProfileOwner(targetProfile, userId)) {
    return NextResponse.json(
      {
        message: "Following list is private for this profile.",
        privacyBlocked: true,
      },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const usersList = await getFollowingsForUser(targetProfile.userid);

  return NextResponse.json(usersList, {
    status: 200,
    headers: {
      "Cache-Control": "private, max-age=30, stale-while-revalidate=120",
    },
  });
};
