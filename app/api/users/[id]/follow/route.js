import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectdb } from "@/app/lib/db";
import { followUserRelationship } from "@/app/lib/followService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = async (_req, { params }) => {
  await connectdb();

  const signeduser = await currentUser();
  if (!signeduser) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }

  if (params?.id?.toString?.() === signeduser.id.toString()) {
    return NextResponse.json({ message: "You cannot follow yourself" }, { status: 400 });
  }

  const result = await followUserRelationship({
    followerId: signeduser.id.toString(),
    followingId: params?.id?.toString?.(),
  });

  if (!result) {
    return NextResponse.json({ message: "No user found" }, { status: 404 });
  }

  return NextResponse.json(result, {
    status: result.relationship === "requested" ? 202 : 201,
    headers: { "Cache-Control": "no-store" },
  });
};
