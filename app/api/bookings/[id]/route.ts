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
            title: true,
          },
        },
      },
    });

    if (!booking || booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(booking);
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

    // If changing date, check availability
    if (validatedData.date) {
      const newDate = new Date(validatedData.date);

      const isAvailable = await prisma.availability.findUnique({
        where: {
          guidePostId_date: {
            guidePostId: existingBooking.guidePostId,
            date: newDate,
          },
        },
      });

      if (!isAvailable || !isAvailable.isAvailable) {
        return NextResponse.json(
          { error: "Selected date is not available" },
          { status: 400 }
        );
      }
    }

    // Update the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(validatedData.date && { date: new Date(validatedData.date) }),
        ...(validatedData.adultCount && {
          adultCount: validatedData.adultCount,
        }),
        ...(validatedData.status && { status: validatedData.status }),
      },
    });

    // If date changed, update availabilities
    if (validatedData.date) {
      // Reset old availability
      await prisma.availability.update({
        where: {
          guidePostId_date: {
            guidePostId: existingBooking.guidePostId,
            date: existingBooking.date,
          },
        },
        data: { isAvailable: true },
      });

      // Set new availability
      await prisma.availability.update({
        where: {
          guidePostId_date: {
            guidePostId: existingBooking.guidePostId,
            date: updatedBooking.date,
          },
        },
        data: { isAvailable: false },
      });
    }

    return NextResponse.json(updatedBooking);
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

    // Delete the booking
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    // Update availability
    await prisma.availability.update({
      where: {
        guidePostId_date: {
          guidePostId: existingBooking.guidePostId,
          date: existingBooking.date,
        },
      },
      data: { isAvailable: true },
    });

    return NextResponse.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}