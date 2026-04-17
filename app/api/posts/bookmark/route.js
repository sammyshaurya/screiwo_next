import { connectDB } from '../../../lib/db';
import { auth } from '@clerk/nextjs/server';
import Bookmark from '../../../models/Bookmark.model';
import Posts from '../../../models/Posts.model';
import Activity from '../../../models/Activity.model';

// GET user's bookmarks
export async function GET(req) {
  try {
    await connectDB();
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bookmarks = await Bookmark.find({ userId })
      .populate('postId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Bookmark.countDocuments({ userId });

    return Response.json({
      success: true,
      bookmarks: bookmarks.map((b) => b.postId),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create a bookmark
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

    // Check if post exists
    const post = await Posts.findById(postId);
    if (!post) {
      return Response.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({ userId, postId });
    if (existingBookmark) {
      return Response.json(
        { success: false, error: 'Post already bookmarked' },
        { status: 400 }
      );
    }

    // Create bookmark
    const bookmark = new Bookmark({ userId, postId });
    await bookmark.save();

    // Update post saves count
    post.saves = (post.saves || 0) + 1;
    await post.save();

    // Create activity record
    await Activity.create({
      userId,
      type: 'post_bookmark',
      postId,
    });

    return Response.json({
      success: true,
      message: 'Post bookmarked successfully',
      saves: post.saves,
    });
  } catch (error) {
    console.error('Error bookmarking post:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
