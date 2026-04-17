import Feed from "@/app/models/Feed.model";
import Profile from "@/app/models/Profile.model";

async function FeedUpdate(authorId, authorUsername, feedpost, FollowingsList) {
  const post = { feed: feedpost, username: authorUsername, createdAt: new Date() };
  const recipients = new Set([authorId, ...(FollowingsList || [])]);

  try {
    const updates = Array.from(recipients).map((userId) =>
      Feed.findOneAndUpdate(
        { userid: userId },
        {
          $push: {
            items: {
              $each: [post],
              $position: 0,
            },
          },
        },
        { upsert: true, new: true }
      )
    );

    await Promise.all(updates);
  } catch (err) {
    console.error("Error updating user feeds:", err);
  }
}

async function FeedFromFollow(followerID, followingID, followingUsername) {
  try {
    const followingProfile = await Profile.aggregate([
      { $match: { userid: followingID } },
      { $unwind: "$posts" },
      { $sort: { "posts.createdat": -1 } },
      { $limit: 3 },
      { $project: { posts: 1 } },
    ]);

    if (!followingProfile?.length) {
      console.error("No recent posts found for the followed user");
      return;
    }

    const feedDocument = await Feed.findOne({ userid: followerID });
    const existingPostIds = new Set(
      (feedDocument?.items || [])
        .map((item) => item.feed?._id?.toString())
        .filter(Boolean)
    );

    const newFeedItems = [];
    for (const item of followingProfile) {
      const post = item.posts;
      const postId = post?._id?.toString();
      if (!postId || existingPostIds.has(postId)) {
        continue;
      }

      newFeedItems.push({ feed: post, username: followingUsername, createdAt: new Date() });
    }

    if (newFeedItems.length > 0) {
      await Feed.findOneAndUpdate(
        { userid: followerID },
        {
          $push: {
            items: {
              $each: newFeedItems.reverse(),
              $position: 0,
            },
          },
        },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error("Error updating feed from follow:", error);
  }
}

export { FeedUpdate, FeedFromFollow };
