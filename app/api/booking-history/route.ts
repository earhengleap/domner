import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/authOptions";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      select: {
        id: true,
        date: true,
        adultCount: true,
        status: true,
        totalPrice: true,
        createdAt: true,
        guidePost: {
          select: {
            userId: true,
            title: true,
            location: true,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const bookingIds = bookings.map((booking) => booking.id);

    const requestNotifications = bookingIds.length
      ? await (prisma as any).notification.findMany({
          where: {
            actorId: session.user.id,
            type: {
              in: ["booking_cancel_request", "booking_change_request"],
            },
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
        resolvedAt?: string;
      }
    >();

    const changeRequestByBooking = new Map<
      string,
      {
        id: string;
        status: string;
        reason: string;
        requestedAt: string;
      }
    >();

    for (const notification of requestNotifications) {
      let details: any = {};
      try {
        details = notification.bookingDetails
          ? JSON.parse(notification.bookingDetails)
          : {};
      } catch {
        details = {};
      }

      if (
        notification.type === "booking_cancel_request" &&
        !cancelRequestByBooking.has(notification.relatedPostId)
      ) {
        cancelRequestByBooking.set(notification.relatedPostId, {
          id: notification.id,
          status: details.status || "PENDING",
          reason: details.reason || "",
          requestedAt: notification.createdAt.toISOString(),
          resolvedAt: details.resolvedAt,
        });
      }

      if (
        notification.type === "booking_change_request" &&
        !changeRequestByBooking.has(notification.relatedPostId)
      ) {
        changeRequestByBooking.set(notification.relatedPostId, {
          id: notification.id,
          status: details.status || "PENDING",
          reason: details.reason || "",
          requestedAt: notification.createdAt.toISOString(),
        });
      }
    }

    return NextResponse.json(
      bookings.map((booking) => ({
        ...booking,
        guidePost: {
          ...booking.guidePost,
          guideName:
            booking.guidePost.user?.guideProfile
              ? `${booking.guidePost.user.guideProfile.firstName} ${booking.guidePost.user.guideProfile.lastName}`.trim()
              : booking.guidePost.user?.name || "Guide",
        },
        cancelRequest: cancelRequestByBooking.get(booking.id) ?? null,
        changeRequest: changeRequestByBooking.get(booking.id) ?? null,
      }))
    );
  } catch (error) {
    console.error("Error fetching booking history:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
