import { kv } from "@vercel/kv";

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

export default FeedUpdate;
