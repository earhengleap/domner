// app/api/confirm-aba-payment/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    // Update availability
    await prisma.availability.update({
      where: {
        guidePostId_date: {
          guidePostId: booking.guidePostId,
          date: booking.date,
        },
      },
      data: { isAvailable: false },
    });

    const redirectUrl = new URL('/booking-success', req.url);
    redirectUrl.searchParams.set('bookingId', bookingId);

    return NextResponse.json({ 
      status: 'success', 
      message: 'ABA Payment confirmed successfully',
      redirectUrl: redirectUrl.toString()
    });
  } catch (error) {
    console.error('Error confirming ABA payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
