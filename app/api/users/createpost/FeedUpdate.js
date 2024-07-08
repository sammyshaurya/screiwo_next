import { kv } from "@vercel/kv";
import Profile from "@/app/models/Profile.model";
import db from "mongoose";

async function FeedUpdate(authorId, postId) {
  const authorProfile = await Profile.findOne({ userid: authorId });
  const followers = authorProfile.FollowersList;

  const usersToUpdate = [authorId, ...followers];
  const score = 70;
  try {
    for (const userId of usersToUpdate) {
      const postCache = JSON.stringify({ score, value: postId });
      await kv.lpush(`userFeed:${userId}`, postCache);
    }
  } catch (error) {
    console.error("Error updating feed:", error);
  }
}

async function FeedFromFollow(followerID, followingID) {
  try {
    const followingProfile = await Profile.aggregate([
      { $match: { username: "sammyshaurya" } },
      { $project: { posts: 1 } },
      { $unwind: "$posts" },
      { $sort: { "posts.createdat": -1 } },
      { $limit: 3 },
    ]);

    if (!followingProfile) {
      console.error("No posts found for the following user");
      return;
    }

    const score = 70;
    const currentFeed = await kv.lrange(`userFeed:${followerID}`, 0, -1);
    const existingPostIds = currentFeed.map((item) => item.value);

    for (const post of followingProfile) {
      const postId = post.posts._id.toString();
      if (!existingPostIds.includes(postId)) {
        const postCache = JSON.stringify({ score, value: postId });
        console.log("Adding post to feed:", postCache);
        await kv.lpush(`userFeed:${followerID}`, postCache);
        console.log("Feed updated");
      }
    }

    console.log(await kv.lrange(`userFeed:${followerID}`, 0, -1));
  } catch (error) {
    console.error("Error updating feed from follow:", error);
  }
}

export { FeedUpdate, FeedFromFollow };
