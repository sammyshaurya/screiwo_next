import { NextResponse } from "next/server";
import { connectdb } from "@/app/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import Profile from "@/app/models/Profile.model";
import { normalizeUsername, createUsernameRegex } from "@/app/lib/username";

export const GET = async (req) => {
  try {
    await connectdb();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    const username = normalizeUsername(req.nextUrl.searchParams.get("username"));
    if (!username) {
      return NextResponse.json({ message: "Username is required." }, { status: 400 });
    }

    const currentProfile = await Profile.findOne({ userid: user.id }, { username: 1 }).lean();
    if (normalizeUsername(currentProfile?.username) === username) {
      return NextResponse.json(
        {
          available: true,
          current: true,
          message: "This is your current username.",
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const existingProfile = await Profile.findOne({
      username: createUsernameRegex(username),
      userid: { $ne: user.id },
    }).lean();

    return NextResponse.json(
      {
        available: !existingProfile,
        current: false,
        message: existingProfile ? "Username is already taken." : "Username is available.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error checking username availability:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
