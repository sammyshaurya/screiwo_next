import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectdb } from "@/app/lib/db";
import { followUserRelationship, unfollowUserRelationship } from "@/app/lib/followService";

export const POST = async (req) => {
  await connectdb();

  const signeduser = await currentUser();
  if (!signeduser) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }

  try {
    const body = await req.json();
    const followUser = body.followUser?.toString?.();

    if (!followUser) {
      return NextResponse.json({ message: "Following ID is missing" }, { status: 400 });
    }

    const result = await followUserRelationship({
      followerId: signeduser.id.toString(),
      followingId: followUser,
    });

    if (!result) {
      return NextResponse.json({ message: "No user found" }, { status: 404 });
    }

    return NextResponse.json(result, {
      status: result.relationship === "requested" ? 202 : 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};

export const DELETE = async (req) => {
  await connectdb();

  const signeduser = await currentUser();
  if (!signeduser) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }

  try {
    const followUser = req.nextUrl.searchParams.get("followUser")?.toString?.();

    if (!followUser) {
      return NextResponse.json({ message: "Following ID is missing" }, { status: 400 });
    }

    const result = await unfollowUserRelationship({
      followerId: signeduser.id.toString(),
      followingId: followUser,
    });

    return NextResponse.json(result, {
      status: result?.noOp ? 202 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
