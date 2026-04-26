import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectdb } from "@/app/lib/db";
import { getPendingFollowRequests, acceptFollowRequest, declineFollowRequest } from "@/app/lib/followService";

export const GET = async () => {
  await connectdb();
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }

  const requests = await getPendingFollowRequests(userId);

  return NextResponse.json(
    { requests },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
};

export const POST = async (req) => {
  await connectdb();
  const signeduser = await currentUser();
  if (!signeduser) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }

  const body = await req.json();
  const requestUser = body.requestUser?.toString?.();
  const action = body.action || "accept";

  if (!requestUser) {
    return NextResponse.json({ message: "Request user is missing" }, { status: 400 });
  }

  const result =
    action === "decline"
      ? await declineFollowRequest({
          recipientId: signeduser.id.toString(),
          requesterId: requestUser,
        })
      : await acceptFollowRequest({
          recipientId: signeduser.id.toString(),
          requesterId: requestUser,
        });

  return NextResponse.json(result, {
    status: result?.noOp ? 202 : 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
};
