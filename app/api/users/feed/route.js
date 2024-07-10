import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { headers } from 'next/headers';
import { connectdb } from "@/app/lib/db";
import { verifyUser } from "../../middleware/fetchData";

export const GET = async (req) => {
  await connectdb();
  await verifyUser(req);
  
  try {
    if (!req.verified) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    const headersList = headers();
    const user = headersList.get('user');

    // Fetch the post IDs from Vercel KV
    const feeds = await kv.lrange(`userFeed:${user}`, 0, -1);
    

    if (!feeds || feeds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(feeds, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
