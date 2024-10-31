// app/api/capture-paypal-payment/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { capturePayPalPayment } from "@/lib/paypal";
import prisma from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, bookingId } = await req.json();

    if (!orderId || !bookingId) {
      return NextResponse.json({ error: 'Missing orderId or bookingId' }, { status: 400 });
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

    const captureData = await capturePayPalPayment(orderId);

    if (captureData.status === 'COMPLETED') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      });

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
        message: 'Payment captured successfully',
        redirectUrl: redirectUrl.toString() 
      });
    } else {
      return NextResponse.json({ 
        status: 'failed', 
        message: 'Payment capture failed',
        captureData 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}