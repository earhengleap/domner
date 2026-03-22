import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const reason =
      typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        guidePost: {
          select: {
            title: true,
            userId: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking || booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    if (booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Only confirmed bookings can request cancellation" },
        { status: 400 }
      );
    }

    const existingRequests = await (prisma as any).notification.findMany({
      where: {
        userId: booking.guidePost.userId,
        actorId: session.user.id,
        type: "booking_cancel_request",
        relatedPostId: booking.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const hasPendingRequest = existingRequests.some((notification: any) => {
      try {
        const details = notification.bookingDetails
          ? JSON.parse(notification.bookingDetails)
          : {};
        return details.status === "PENDING";
      } catch {
        return false;
      }
    });

    if (hasPendingRequest) {
      return NextResponse.json(
        { error: "A cancellation request is already pending" },
        { status: 400 }
      );
    }

    const notification = await (prisma as any).notification.create({
      data: {
        userId: booking.guidePost.userId,
        actorId: session.user.id,
        type: "booking_cancel_request",
        message: `${booking.user.name || booking.user.email || "A user"} requested to cancel a booking.`,
        relatedPostId: booking.id,
        bookingDetails: JSON.stringify({
          bookingId: booking.id,
          bookingTitle: booking.guidePost.title,
          requestedDate: booking.date.toISOString(),
          requesterName: booking.user.name || "",
          requesterEmail: booking.user.email || "",
          adultCount: booking.adultCount,
          totalPrice: booking.totalPrice,
          reason,
          status: "PENDING",
        }),
        isRead: false,
      },
    });

    return NextResponse.json({
      id: notification.id,
      status: "PENDING",
      reason,
    });
  } catch (error) {
    console.error("Error creating cancellation request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
