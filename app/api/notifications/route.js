import { connectDB } from '../../lib/db';
import { auth } from '@clerk/nextjs/server';
import Notification from '../../models/Notification.model';

// GET user's notifications
export async function GET(req) {
  try {
    await connectDB();
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notifications = await Notification.find({ userId })
      .populate('fromUserId', 'FirstName LastName username profileImageUrl')
      .populate('postId', '_id title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ userId });
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    return Response.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET unread notification count
export async function HEAD(req) {
  try {
    await connectDB();
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    return new Response(null, {
      headers: {
        'X-Unread-Count': unreadCount,
      },
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
