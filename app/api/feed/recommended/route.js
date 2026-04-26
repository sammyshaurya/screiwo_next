import { connectDB } from '../../../lib/db';
import { auth } from '@clerk/nextjs/server';
import Posts from '../../../models/Posts.model';
import Activity from '../../../models/Activity.model';
import Profile from '../../../models/Profile.model';
import Follow from '../../../models/Follow.model';
import { hydratePostSummaries, POST_SUMMARY_PROJECTION } from '../../../lib/postData';

export async function GET(req) {
  try {
    await connectDB();
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);

    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const followingRelations = await Follow.find(
      { followerId: userId, status: 'following' },
      { followingId: 1, _id: 0 }
    ).lean();
    const followingIds = followingRelations.map((relation) => relation.followingId);

    // Get user's activity (liked posts, commented posts) to understand preferences
    const userActivity = await Activity.find({ userId })
      .populate('postId')
      .sort({ createdAt: -1 })
      .limit(50);

    // Get categories/topics the user is interested in (based on likes and comments)
    const likedPostIds = userActivity
      .filter((a) => a.type === 'post_like' || a.type === 'post_comment')
      .map((a) => a.postId?._id)
      .filter(Boolean);

    // Build recommendation score for each post
    let recommendedPosts = [];

    // 1. Posts from followed users (high priority)
    const followersPostsQuery = Posts.find({
      userid: { $in: followingIds },
      isDeleted: { $ne: true },
      _id: { $nin: likedPostIds }, // Don't recommend posts already interacted with
    }, POST_SUMMARY_PROJECTION)
      .sort({ DateofCreation: -1, likes: -1 })
      .limit(limit * 2);

    const followersPosts = await followersPostsQuery;

    // 2. Posts from same interests (if we have user preferences)
    let similarInterestPosts = [];
    if (likedPostIds.length > 0) {
      similarInterestPosts = await Posts.find({
        _id: { $in: likedPostIds },
        isDeleted: { $ne: true },
      }, POST_SUMMARY_PROJECTION)
        .sort({ likes: -1 })
        .limit(5);
    }

    // 3. Trending posts (high engagement)
    const trendingPosts = await Posts.find({
      userid: { $nin: [userId, ...followingIds] },
      isDeleted: { $ne: true },
      likes: { $gte: 5 },
      DateofCreation: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
    }, POST_SUMMARY_PROJECTION)
      .sort({ likes: -1, commentscount: -1, DateofCreation: -1 })
      .limit(limit);

    // Combine and deduplicate
    const postMap = new Map();

    // Add followed users posts with priority 3
    followersPosts.forEach((post) => {
      if (!postMap.has(post._id.toString())) {
        postMap.set(post._id.toString(), { post, score: 30 + (post.likes || 0) });
      }
    });

    // Add similar interest posts with priority 2
    similarInterestPosts.forEach((post) => {
      if (!postMap.has(post._id.toString())) {
        postMap.set(post._id.toString(), { post, score: 20 + (post.likes || 0) });
      }
    });

    // Add trending posts with priority 1
    trendingPosts.forEach((post) => {
      if (!postMap.has(post._id.toString())) {
        postMap.set(post._id.toString(), { post, score: 10 + (post.likes || 0) });
      }
    });

    // Sort by score and get the top posts
    recommendedPosts = Array.from(postMap.values())
      .sort((a, b) => b.score - a.score)
      .map((item) => item.post)
      .slice(skip, skip + limit);

    const total = postMap.size;

    return Response.json({
      success: true,
      posts: await hydratePostSummaries(recommendedPosts),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
