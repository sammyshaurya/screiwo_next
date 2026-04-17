import { connectDB } from '../../../lib/db';
import { auth } from '@clerk/nextjs/server';
import Like from '../../../models/Like.model';
import Posts from '../../../models/Posts.model';

export async function POST(req) {
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

    // Check if like exists
    const like = await Like.findOneAndDelete({ userId, postId });
    if (!like) {
      return Response.json(
        { success: false, error: 'Like not found' },
        { status: 404 }
      );
    }

    // Update post likes count
    const post = await Posts.findById(postId);
    if (post) {
      post.likes = Math.max((post.likes || 0) - 1, 0);
      await post.save();
    }

    return Response.json({
      success: true,
      message: 'Post unliked successfully',
      likes: post?.likes || 0,
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
