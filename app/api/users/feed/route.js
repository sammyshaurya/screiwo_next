import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { headers } from 'next/headers';
import { connectdb } from "@/app/lib/db";
import { verifyUser } from "../../middleware/fetchData";
import Profile from "@/app/models/Profile.model";

export const GET = async (req) => {
  await connectdb();
  await verifyUser(req);
  
  try {
    if (!req.verified) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    const headersList = headers();
    const user = headersList.get('user');
    const token = headersList.get('Authorization');

    // Fetch the post IDs from Vercel KV
    const postIds = await kv.lrange(`userFeed:${user}`, 0, -1);

    if (!postIds || postIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const postsWithUserInfo = [];

    // Loop over the postIds to fetch corresponding posts
    for (const postIdObj of postIds) {
      const postId = postIdObj.value;
      
      const profile = await Profile.findOne({ "posts._id": postId });

      if (profile) {
        const post = profile.posts.id(postId);
        
        if (post) {
          postsWithUserInfo.push({
            post,
            user: {
              username: profile.username,
              firstName: profile.FirstName,
              lastName: profile.LastName,
              avatar: profile.avatar,
              profileType: profile.profileType,
            }
          });
        }
      }
    }

    return NextResponse.json(postsWithUserInfo, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
