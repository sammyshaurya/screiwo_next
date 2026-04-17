import { connectDB } from '../../../../lib/db';
import { auth } from '@clerk/nextjs/server';
import Comment from '../../../../models/Comment.model';
import Posts from '../../../../models/Posts.model';

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('id');
    const { userId } = await auth();

    if (!commentId || !userId) {
      return Response.json(
        { success: false, error: 'Missing commentId or userId' },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return Response.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user is the comment author
    if (comment.userId.toString() !== userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Soft delete
    comment.isDeleted = true;
    await comment.save();

    // Update counts
    if (!comment.parentCommentId) {
      // Top-level comment
      const post = await Posts.findById(comment.postId);
      if (post) {
        post.commentscount = Math.max((post.commentscount || 0) - 1, 0);
        await post.save();
      }
    } else {
      // Reply to a comment
      const parentComment = await Comment.findById(comment.parentCommentId);
      if (parentComment) {
        parentComment.repliesCount = Math.max((parentComment.repliesCount || 0) - 1, 0);
        await parentComment.save();
      }
    }

    return Response.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
