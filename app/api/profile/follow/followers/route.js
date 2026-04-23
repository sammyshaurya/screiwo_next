import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";
import { normalizeUsername, createUsernameRegex } from "@/app/lib/username";

export const GET = async (req) => {
    await connectdb();
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json("Unauthorized access", { status: 401 });
    }

    const username = normalizeUsername(req.nextUrl.searchParams.get("username"));
    const targetProfile = username
        ? await Profile.findOne({ username: createUsernameRegex(username) }, { FollowersList: 1 }).lean()
        : await Profile.findOne({ userid: userId }, { FollowersList: 1 }).lean();

    if (!targetProfile) {
        return NextResponse.json([], { status: 200 });
    }

    const usersList = await Profile.find(
        { userid: { $in: targetProfile.FollowersList || [] } },
        { username: 1, userid: 1, FirstName: 1, LastName: 1, profileImageUrl: 1 }
    ).lean();

    return NextResponse.json(usersList, {
        status: 200,
        headers: {
            "Cache-Control": "private, max-age=30, stale-while-revalidate=120",
        },
    });
};
