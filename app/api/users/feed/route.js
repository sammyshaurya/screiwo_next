import { NextResponse } from "next/server";
import { connectdb } from "@/app/lib/db";
import { auth } from "@clerk/nextjs/server";
import Feed from "@/app/models/Feed.model";

export const GET = async () => {
  try {
    await connectdb();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    const feedDocument = await Feed.findOne({ userid: userId }).lean();
    const feeds = feedDocument?.items || [];

    return NextResponse.json(feeds, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
};
