import { connectDB } from '../../../lib/db';
import { auth } from '@clerk/nextjs/server';
import Posts from '../../../models/Posts.model';
import Profile from '../../../models/Profile.model';
import Feed from '../../../models/Feed.model';
import { buildPostDerivedFields } from '../../../lib/postData';
import { syncProfileCounters } from '../../../lib/profileData';

// PATCH edit a post
export async function PATCH(req) {
  try {
    await connectDB();
    const { postId, title, content } = await req.json();
    const { userId } = await auth();

    if (!userId || !postId) {
      return Response.json(
        { success: false, error: 'Missing postId or userId' },
        { status: 400 }
      );
    }

    const post = await Posts.findById(postId);
    if (!post) {
      return Response.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user is the post author
    if (post.userid !== userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update post
    if (title) post.title = title;
    if (content) {
      post.content = content;
      Object.assign(post, buildPostDerivedFields(content));
    }
    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    await Feed.updateMany(
      { 'items.postId': post._id },
      {
        $set: {
          ...(title ? { 'items.$[item].rankReason': `edited:${title}` } : {}),
          ...(content ? { 'items.$[item].rankReason': 'edited' } : {}),
        },
      },
      {
        arrayFilters: [{ 'item.postId': post._id }],
      }
    );

    await syncProfileCounters(post.userid);

    return Response.json({
      success: true,
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a post
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('id');
    const { userId } = await auth();

    if (!userId || !postId) {
      return Response.json(
        { success: false, error: 'Missing postId or userId' },
        { status: 400 }
      );
    }

    const post = await Posts.findById(postId);
    if (!post) {
      return Response.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user is the post author
    if (post.userid !== userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Soft delete
    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();
    await Profile.updateOne(
      { userid: userId },
      { $inc: { postCount: -1 } }
    );
    await Feed.updateMany(
      { 'items.postId': post._id },
      {
        $pull: { items: { postId: post._id } },
      },
    );

    await syncProfileCounters(userId);

    return Response.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
