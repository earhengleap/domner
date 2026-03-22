import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { hasGuideAccess } from "@/lib/access";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateGuideBookingSchema = z.object({
  status: z.enum(["CONFIRMED"]),
});

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
    const validatedData = updateGuideBookingSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        guidePost: {
          select: {
            userId: true,
            title: true,
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
    });

    if (!booking || booking.guidePost.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending bookings can be confirmed" },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: validatedData.status },
    });

    await (prisma as any).notification.create({
      data: {
        userId: booking.user.id,
        actorId: session.user.id,
        type: "booking_status_update",
        relatedPostId: booking.id,
        message: `Your booking for "${booking.guidePost.title}" has been confirmed by the guide.`,
        bookingDetails: JSON.stringify({
          bookingId: booking.id,
          status: validatedData.status,
        }),
        isRead: false,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating guide booking:", error);
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
