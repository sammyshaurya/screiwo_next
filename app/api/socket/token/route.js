import { auth } from "@clerk/nextjs/server";
import { createSocketToken } from "@/app/lib/socketAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const token = createSocketToken({ userId });

    return Response.json(
      {
        success: true,
        token,
        userId,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: error.message || "Unable to mint socket token" },
      { status: 500 }
    );
  }
}
