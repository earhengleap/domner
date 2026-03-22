// app/api/bookings/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { z } from "zod";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

const updateBookingSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  adultCount: z.number().int().positive().optional(),
  status: z.enum(["CONFIRMED", "CANCELLED"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingId = params.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        guidePost: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
            price: true,
            userId: true,
            user: {
              select: {
                name: true,
                guideProfile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
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
      return NextResponse.json({ error: "Booking not found or unauthorized" }, { status: 404 });
    }

    const requestNotifications = await (prisma as any).notification.findMany({
      where: {
        actorId: session.user.id,
        relatedPostId: booking.id,
        type: {
          in: [
            "booking_cancel_request",
            "booking_cancel_request_result",
            "booking_change_request",
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let cancelRequest = null;
    let changeRequest = null;
    for (const notification of requestNotifications) {
      let details: any = {};
      try {
        details = notification.bookingDetails
          ? JSON.parse(notification.bookingDetails)
          : {};
      } catch {
        details = {};
      }

      if (notification.type?.startsWith("booking_cancel_request") && details.status) {
        cancelRequest = {
          id: notification.id,
          status: details.status,
          reason: details.reason || "",
          requestedAt: details.requestedAt || notification.createdAt.toISOString(),
          resolvedAt: details.resolvedAt,
        };
      }

      if (notification.type === "booking_change_request" && details.status && !changeRequest) {
        changeRequest = {
          id: notification.id,
          status: details.status,
          reason: details.reason || "",
          requestedAt: details.requestedAt || notification.createdAt.toISOString(),
        };
      }

      if (cancelRequest && changeRequest) {
        break;
      }
    }

    return NextResponse.json({
      ...booking,
      guidePost: {
        ...booking.guidePost,
        guideName:
          booking.guidePost.user?.guideProfile
            ? `${booking.guidePost.user.guideProfile.firstName} ${booking.guidePost.user.guideProfile.lastName}`.trim()
            : booking.guidePost.user?.name || "Guide",
      },
      cancelRequest,
      changeRequest,
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingId = params.id;
    const body = await req.json();
    const validatedData = updateBookingSchema.parse(body);

    // Check if the booking exists and belongs to the user
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking || existingBooking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    if (existingBooking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Direct booking edits are disabled. Please request changes from the guide instead." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Direct booking edits are disabled. Please request changes from the guide instead." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating booking:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingId = params.id;

    // Check if the booking exists and belongs to the user
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking || existingBooking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Direct booking cancellation is disabled. Please request the guide first." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
