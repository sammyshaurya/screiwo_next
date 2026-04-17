import { connectDB } from '../../../lib/db';
import { auth } from '@clerk/nextjs/server';
import Bookmark from '../../../models/Bookmark.model';
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

    // Check if bookmark exists
    const bookmark = await Bookmark.findOneAndDelete({ userId, postId });
    if (!bookmark) {
      return Response.json(
        { success: false, error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    // Update post saves count
    const post = await Posts.findById(postId);
    if (post) {
      post.saves = Math.max((post.saves || 0) - 1, 0);
      await post.save();
    }

    return Response.json({
      success: true,
      message: 'Post unbookmarked successfully',
      saves: post?.saves || 0,
    });
  } catch (error) {
    console.error('Error unbookmarking post:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
