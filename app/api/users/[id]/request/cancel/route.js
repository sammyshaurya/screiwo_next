import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectdb } from "@/app/lib/db";
import { cancelFollowRequest } from "@/app/lib/followService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = async (_req, { params }) => {
  await connectdb();

  const signeduser = await currentUser();
  if (!signeduser) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }

  const result = await cancelFollowRequest({
    followerId: signeduser.id.toString(),
    followingId: params?.id?.toString?.(),
  });

  return NextResponse.json(result, {
    status: result?.noOp ? 202 : 200,
    headers: { "Cache-Control": "no-store" },
  });
};
