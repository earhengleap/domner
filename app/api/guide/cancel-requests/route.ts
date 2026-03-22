import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { hasGuideAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !hasGuideAccess(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await (prisma as any).notification.findMany({
      where: {
        userId: session.user.id,
        type: "booking_cancel_request",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const requests = notifications.map((notification: any) => {
      let details: any = {};
      try {
        details = notification.bookingDetails
          ? JSON.parse(notification.bookingDetails)
          : {};
      } catch {
        details = {};
      }

      return {
        id: notification.id,
        message: notification.message,
        bookingId: details.bookingId || notification.relatedPostId,
        bookingTitle: details.bookingTitle || "Booking",
        requestedDate: details.requestedDate || null,
        requesterName: details.requesterName || "",
        requesterEmail: details.requesterEmail || "",
        adultCount: details.adultCount || 0,
        totalPrice: details.totalPrice || 0,
        reason: details.reason || "",
        status: details.status || "PENDING",
        createdAt: notification.createdAt,
        isRead: notification.isRead,
      };
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching cancellation requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
