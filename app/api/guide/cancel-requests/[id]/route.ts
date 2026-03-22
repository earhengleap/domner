import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { hasGuideAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !hasGuideAccess(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const action = body?.action;

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const notification = await (prisma as any).notification.findUnique({
      where: { id: params.id },
    });

    if (
      !notification ||
      notification.userId !== session.user.id ||
      notification.type !== "booking_cancel_request"
    ) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    let details: any = {};
    try {
      details = notification.bookingDetails
        ? JSON.parse(notification.bookingDetails)
        : {};
    } catch {
      details = {};
    }

    if (details.status && details.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    const bookingId = details.bookingId || notification.relatedPostId;
    const requesterId = notification.actorId;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guidePost: {
          select: {
            userId: true,
            title: true,
          },
        },
      },
    });

    if (!booking || booking.guidePost.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    const nextStatus = action === "approve" ? "APPROVED" : "REJECTED";

    await prisma.$transaction(async (tx) => {
      if (action === "approve" && booking.status !== "CANCELLED") {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "CANCELLED" },
        });

        await tx.availability.updateMany({
          where: {
            guidePostId: booking.guidePostId,
            date: booking.date,
          },
          data: { isAvailable: true },
        });
      }

      await (tx as any).notification.update({
        where: { id: notification.id },
        data: {
          isRead: true,
          bookingDetails: JSON.stringify({
            ...details,
            bookingId,
            status: nextStatus,
            resolvedAt: new Date().toISOString(),
          }),
        },
      });

      if (requesterId) {
        await (tx as any).notification.create({
          data: {
            userId: requesterId,
            actorId: session.user.id,
            type: "booking_cancel_request_result",
            relatedPostId: booking.id,
            message:
              action === "approve"
                ? `Your cancellation request for "${booking.guidePost.title}" was approved.`
                : `Your cancellation request for "${booking.guidePost.title}" was rejected.`,
            bookingDetails: JSON.stringify({
              bookingId,
              status: nextStatus,
              resolvedAt: new Date().toISOString(),
            }),
            isRead: false,
          },
        });
      }
    });

    return NextResponse.json({ status: nextStatus });
  } catch (error) {
    console.error("Error processing cancellation request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
