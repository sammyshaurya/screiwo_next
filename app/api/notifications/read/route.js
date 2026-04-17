import { connectDB } from '../../../lib/db';
import { auth } from '@clerk/nextjs/server';
import Notification from '../../../models/Notification.model';

export async function POST(req) {
  try {
    await connectDB();
    const { notificationId, readAll } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (readAll) {
      // Mark all notifications as read
      await Notification.updateMany({ userId, read: false }, { read: true });
      return Response.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    if (!notificationId) {
      return Response.json(
        { success: false, error: 'Missing notificationId' },
        { status: 400 }
      );
    }

    // Mark single notification as read
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return Response.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
