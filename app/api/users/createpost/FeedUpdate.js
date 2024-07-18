import { kv } from "@vercel/kv";
import Profile from "@/app/models/Profile.model";
import mongoose from "mongoose";

async function FeedUpdate(authorId, authorUsername, feedpost, FollowingsList) {
  const post = { feed: feedpost, username: authorUsername };
  try {
    FollowingsList.forEach((follower) => {
      return kv.lpush(`userFeed:${follower}`, post);
    });

    await kv.lpush(`userFeed:${authorId}`, post);
  } catch (err) {
    console.log(err);
  }
}

async function FeedFromFollow(followerID, followingID, username) {
  try {
    console.log("hey")
    const followingProfile = await Profile.aggregate([
      {
        $match: { userid: followingID },
      },
      { $unwind: "$posts" },
      { $sort: { "posts.createdat": -1 } },
      { $limit: 3 },
      { $project: { posts: 1 } }
    ]);
    console.log(followingProfile)


    if (!followingProfile) {
      console.error("No posts found for the following user");
      return;
    }
    const currentFeed = await kv.lrange(`userFeed:${followerID}`, 0, -1);
    const existingPostIds = currentFeed.map((item) => item.feed.userid);

    for (const post of followingProfile) {
      const postId = post.posts.userid.toString();
      if (!existingPostIds.includes(postId)) {
        const postCache = { feed: post.posts, username: username };
        await kv.lpush(`userFeed:${followerID}`, postCache);
      }
    }
  } catch (error) {
    console.error("Error updating feed from follow:", error);
  }
}

export { FeedUpdate, FeedFromFollow };
