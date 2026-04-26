import { connectDB } from '../../../lib/db';
import { auth } from '@clerk/nextjs/server';
import Like from '../../../models/Like.model';
import Posts from '../../../models/Posts.model';
import Activity from '../../../models/Activity.model';
import Profile from '../../../models/Profile.model';
import { enqueueNotificationEvent } from '@/app/lib/notifications/pipeline';

export async function POST(req, context) {
  try {
    await connectDB();
    const { postId } = await req.json();
    const { userId } = await auth();

    if (!userId || !postId) {
      return Response.json(
        { success: false, error: 'Missing postId or userId' },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await Posts.findById(postId);
    if (!post) {
      return Response.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await Like.findOne({ userId, postId });
    if (existingLike) {
      return Response.json(
        { success: false, error: 'Already liked this post' },
        { status: 400 }
      );
    }

    // Create like
    const like = new Like({ userId, postId });
    await like.save();

    // Update post likes count
    post.likes = (post.likes || 0) + 1;
    await post.save();

    // Create activity record
    await Activity.create({
      userId,
      type: 'post_like',
      postId,
    });

    // Create notification (if liker is not the post owner)
    if (post.userid !== userId) {
      const liker = await Profile.findOne({ userid: userId }, { FirstName: 1, username: 1 }).lean();
      const likerName = liker?.FirstName || liker?.username || 'Someone';

      await enqueueNotificationEvent({
        type: 'like',
        recipientId: post.userid,
        actorId: userId,
        postId,
        entityType: 'post',
        entityId: postId,
        groupKey: `like:${post.userid}:${postId}:${userId}`,
        actorSnapshot: {
          userid: userId,
          username: liker?.username || null,
          FirstName: liker?.FirstName || null,
        },
        message: `${likerName} liked your post`,
      });
    }

    return Response.json({
      success: true,
      message: 'Post liked successfully',
      likes: post.likes,
    });
  } catch (error) {
    console.error('Error liking post:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
