import Feed from "@/app/models/Feed.model";
import Posts from "@/app/models/Posts.model";

async function FeedUpdate(authorId, postId, followingsList) {
  const recipients = new Set([authorId, ...(followingsList || [])]);

  try {
    const updates = Array.from(recipients).map((userId) =>
      Feed.findOneAndUpdate(
        { userid: userId },
        {
          $push: {
            items: {
              $each: [{
                postId,
                authorId,
                score: userId === authorId ? 100 : 50,
                source: "following",
                createdAt: new Date(),
              }],
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
    const recentPosts = await Posts.find(
      { userid: followingID, isDeleted: { $ne: true } },
      { _id: 1, DateofCreation: 1, createdAt: 1 }
    )
      .sort({ DateofCreation: -1, createdAt: -1 })
      .limit(3)
      .lean();

    if (!recentPosts.length) {
      console.error("No recent posts found for the followed user");
      return;
    }

    const feedDocument = await Feed.findOne({ userid: followerID });
    const existingPostIds = new Set(
      (feedDocument?.items || [])
        .map((item) => item.postId?.toString())
        .filter(Boolean)
    );

    const newFeedItems = [];
    for (const post of recentPosts) {
      const postId = post?._id?.toString();
      if (!postId || existingPostIds.has(postId)) {
        continue;
      }

      newFeedItems.push({
        postId: post._id,
        authorId: followingID,
        score: 40,
        source: "following",
        rankReason: followingUsername ? `follow:${followingUsername}` : "follow",
        createdAt: new Date(),
      });
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
