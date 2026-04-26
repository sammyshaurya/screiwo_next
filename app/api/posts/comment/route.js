import { connectDB } from '../../../lib/db';
import { auth } from '@clerk/nextjs/server';
import Comment from '../../../models/Comment.model';
import Posts from '../../../models/Posts.model';
import Activity from '../../../models/Activity.model';
import Profile from '../../../models/Profile.model';
import { getProfileMapByUserIds } from '../../../lib/profileData';
import { enqueueNotificationEvent } from '@/app/lib/notifications/pipeline';
import { canViewProfile, canCommentOnPost } from '@/app/lib/profilePrivacy';

// GET comments for a post with pagination
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!postId) {
      return Response.json(
        { success: false, error: 'Missing postId' },
        { status: 400 }
      );
    }

    // Get top-level comments (parentCommentId is null)
    const comments = await Comment.find({
      postId,
      parentCommentId: null,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentCommentId: comment._id,
          isDeleted: { $ne: true },
        })
          .sort({ createdAt: 1 })
          .limit(5)
          .lean();

        return {
          ...comment,
          replies,
        };
      })
    );

    const profileMap = await getProfileMapByUserIds(
      commentsWithReplies.flatMap((comment) => [
        comment.userId,
        ...(comment.replies || []).map((reply) => reply.userId),
      ])
    );

    const hydratedComments = commentsWithReplies.map((comment) => ({
      ...comment,
      userId: profileMap.get(comment.userId) || null,
      replies: (comment.replies || []).map((reply) => ({
        ...reply,
        userId: profileMap.get(reply.userId) || null,
      })),
    }));

    const total = await Comment.countDocuments({
      postId,
      parentCommentId: null,
      isDeleted: { $ne: true },
    });

    return Response.json({
      success: true,
      comments: hydratedComments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create a new comment or reply
export async function POST(req) {
  try {
    await connectDB();
    const { postId, text, parentCommentId } = await req.json();
    const { userId } = await auth();

    if (!userId || !postId || !text?.trim()) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
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

    const authorProfile = await Profile.findOne(
      { userid: post.userid },
      { userid: 1, FollowersList: 1, preferences: 1 }
    ).lean();

    if (!canViewProfile(authorProfile, userId)) {
      return Response.json(
        { success: false, error: 'This profile is private' },
        { status: 403 }
      );
    }

    if (!canCommentOnPost(authorProfile, userId)) {
      return Response.json(
        { success: false, error: 'Comments are disabled for this post' },
        { status: 403 }
      );
    }

    // If replying to a comment, verify parent exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return Response.json(
          { success: false, error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // Create comment
    const comment = new Comment({
      userId,
      postId,
      text: text.trim(),
      parentCommentId: parentCommentId || null,
    });
    await comment.save();
    // Update post comments count (only for top-level comments)
    if (!parentCommentId) {
      post.commentscount = (post.commentscount || 0) + 1;
      await post.save();
    } else {
      // Update parent comment replies count
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment) {
        parentComment.repliesCount = (parentComment.repliesCount || 0) + 1;
        await parentComment.save();
      }
    }

    // Create activity record
    await Activity.create({
      userId,
      type: 'post_comment',
      postId,
    });

    // Create notification
    const commenterProfile = await Profile.findOne(
      { userid: userId },
      { userid: 1, username: 1, FirstName: 1, LastName: 1, profileImageUrl: 1 }
    ).lean();
    const commenterName = commenterProfile?.FirstName || commenterProfile?.username || 'Someone';

    if (parentCommentId) {
      // Notify the user whose comment is being replied to (if not self)
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment && parentComment.userId.toString() !== userId) {
        await enqueueNotificationEvent({
          type: 'reply',
          recipientId: parentComment.userId.toString(),
          actorId: userId,
          postId,
          commentId: comment._id,
          entityType: 'comment',
          entityId: parentCommentId,
          groupKey: `reply:${parentComment.userId.toString()}:${parentCommentId}:${userId}`,
          actorSnapshot: {
            userid: userId,
            username: commenterProfile?.username || null,
            FirstName: commenterProfile?.FirstName || null,
          },
          message: `${commenterName} replied to your comment`,
        });
      }
    } else {
      // Notify post owner (if not self)
      if (post.userid !== userId) {
        await enqueueNotificationEvent({
          type: 'comment',
          recipientId: post.userid,
          actorId: userId,
          postId,
          commentId: comment._id,
          entityType: 'post',
          entityId: postId,
          groupKey: `comment:${post.userid}:${postId}:${userId}`,
          actorSnapshot: {
            userid: userId,
            username: commenterProfile?.username || null,
            FirstName: commenterProfile?.FirstName || null,
          },
          message: `${commenterName} commented on your post`,
        });
      }
    }

    return Response.json({
      success: true,
      message: 'Comment created successfully',
      comment: {
        ...comment.toObject(),
        userId: commenterProfile || null,
      },
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
