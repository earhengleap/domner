import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createPayPalOrder } from "@/lib/paypal";
import prisma from "@/lib/db";
import { z } from "zod";

// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";

const bookingSchema = z.object({
  guidePostId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adultCount: z.number().int().positive(),
});

const DEFAULT_FEE_RATE = 0.1; // 10% default fee rate

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = bookingSchema.parse(body);

    // Check if the guide post exists and is available
    const guidePost = await prisma.guidePost.findUnique({
      where: { id: validatedData.guidePostId },
      include: { user: true },
    });

    if (!guidePost) {
      return NextResponse.json(
        { error: "Guide post not found" },
        { status: 404 }
      );
    }

    const isAvailable = await prisma.availability.findUnique({
      where: {
        guidePostId_date: {
          guidePostId: validatedData.guidePostId,
          date: new Date(validatedData.date),
        },
      },
    });

    if (!isAvailable || !isAvailable.isAvailable) {
      return NextResponse.json(
        { error: "Selected date is not available" },
        { status: 400 }
      );
    }

    // Calculate amounts
    const feeConfig = await prisma.feeConfiguration.findFirst();
    const feeRate = feeConfig?.feeRate ?? DEFAULT_FEE_RATE;
    const baseAmount = guidePost.price * validatedData.adultCount;
    const feeAmount = baseAmount * feeRate;
    const totalAmount = baseAmount;
    const guideEarnings = baseAmount - feeAmount;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        guidePostId: validatedData.guidePostId,
        date: new Date(validatedData.date),
        adultCount: validatedData.adultCount,
        status: "PENDING",
        totalPrice: totalAmount,
        feeAmount: feeAmount,
      },
    });

    // Update GuideFinance
    const guideFinance = await prisma.guideFinance.upsert({
      where: { userId: guidePost.userId },
      update: { balance: { increment: guideEarnings } },
      create: { userId: guidePost.userId, balance: guideEarnings },
    });

    // Update GuideBalance
    await prisma.guideBalance.upsert({
      where: { userId: guidePost.userId },
      update: { balance: { increment: guideEarnings } },
      create: { userId: guidePost.userId, balance: guideEarnings },
    });

    // Create GuideTransaction
    await prisma.guideTransaction.create({
      data: {
        guideFinanceId: guideFinance.id,
        amount: guideEarnings,
        type: "CREDIT",
        description: `Earnings from booking ${booking.id}`,
      },
    });

    // Update AdminFinance
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 500 }
      );
    }

    const adminFinance = await prisma.adminFinance.upsert({
      where: { userId: adminUser.id },
      update: {
        totalFees: { increment: feeAmount },
        transactionCount: { increment: 1 },
        lastUpdated: new Date(),
      },
      create: {
        userId: adminUser.id,
        totalFees: feeAmount,
        transactionCount: 1,
        lastUpdated: new Date(),
      },
    });

    // Create AdminTransaction
    await prisma.adminTransaction.create({
      data: {
        adminFinanceId: adminFinance.id,
        amount: feeAmount,
        bookingId: booking.id,
        description: `Fee from booking ${booking.id}`,
      },
    });

    // Create notification for the guide
    await prisma.notification.create({
      data: {
        userId: guidePost.userId,
        message: `New booking (pending payment) for "${guidePost.title}" on ${validatedData.date} for ${validatedData.adultCount} adult(s)`,
        bookingDetails: JSON.stringify({
          title: guidePost.title,
          date: validatedData.date,
          adultCount: validatedData.adultCount,
          totalAmount: totalAmount,
        }),
      },
    });

    // Create PayPal order
    const paypalOrder = await createPayPalOrder(booking.id, totalAmount);

    return NextResponse.json({
      bookingId: booking.id,
      paypalOrderId: paypalOrder.id,
      totalAmount: totalAmount,
    });
  } catch (error) {
    console.error("Error creating booking and PayPal order:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create booking and PayPal order" },
      { status: 500 }
    );
  }
}
