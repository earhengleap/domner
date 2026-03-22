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

    const bookings = await prisma.booking.findMany({
      where: {
        guidePost: {
          userId: session.user.id,
        },
      },
      select: {
        id: true,
        date: true,
        adultCount: true,
        status: true,
        totalPrice: true,
        feeAmount: true,
        createdAt: true,
        guidePost: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const bookingIds = bookings.map((booking) => booking.id);

    const cancelNotifications = bookingIds.length
      ? await (prisma as any).notification.findMany({
          where: {
            userId: session.user.id,
            type: "booking_cancel_request",
            relatedPostId: {
              in: bookingIds,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : [];

    const cancelRequestByBooking = new Map<
      string,
      {
        id: string;
        status: string;
        reason: string;
        requestedAt: string;
      }
    >();

    for (const notification of cancelNotifications) {
      if (cancelRequestByBooking.has(notification.relatedPostId)) {
        continue;
      }

      let details: any = {};
      try {
        details = notification.bookingDetails
          ? JSON.parse(notification.bookingDetails)
          : {};
      } catch {
        details = {};
      }

      cancelRequestByBooking.set(notification.relatedPostId, {
        id: notification.id,
        status: details.status || "PENDING",
        reason: details.reason || "",
        requestedAt: details.requestedAt || notification.createdAt.toISOString(),
      });
    }

    return NextResponse.json(
      bookings.map((booking) => ({
        ...booking,
        cancelRequest: cancelRequestByBooking.get(booking.id) ?? null,
      }))
    );
  } catch (error) {
    console.error("Error fetching guide bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
