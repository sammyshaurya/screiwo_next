import { connectDB } from "../../../lib/db";
import { auth } from "@clerk/nextjs/server";
import Notification from "../../../models/Notification.model";
import { getPendingFollowRequests } from "../../../lib/followService";

export async function GET() {
  try {
    await connectDB();
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const [unreadCount, requests] = await Promise.all([
      Notification.countDocuments({ userId, read: false }),
      getPendingFollowRequests(userId),
    ]);

    return Response.json({
      success: true,
      unreadCount,
      requestCount: Array.isArray(requests) ? requests.length : 0,
    });
  } catch (error) {
    console.error("Error fetching notification summary:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
