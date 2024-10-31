// app/api/bookings/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { createPayPalOrder } from "@/lib/paypal";
import { authOptions } from "@/lib/authOptions";

// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";
// Constants
const ADMIN_FEE_RATE = 0.1; // 10% fee

// Types
interface CreateBookingRequest {
  guidePostId: string;
  date: string;
  adultCount: number;
}

interface CreateBookingResponse {
  bookingId: string;
  paypalOrderId: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CreateBookingResponse | { message: string }>> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = (await request.json()) as CreateBookingRequest;
    const { guidePostId, date, adultCount } = body;

    // Validate required fields
    if (!guidePostId || !date || !adultCount) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch guide post
    const guidePost = await prisma.guidePost.findUnique({
      where: { id: guidePostId },
      include: { user: true },
    });

    if (!guidePost) {
      return NextResponse.json(
        { message: "Guide post not found" },
        { status: 404 }
      );
    }

    // Calculate prices
    const totalPrice = guidePost.price * adultCount;
    const adminFee = totalPrice * ADMIN_FEE_RATE;
    const guideEarnings = totalPrice - adminFee;

    // Perform database operations in transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create booking
      const booking = await prisma.booking.create({
        data: {
          guidePostId,
          date: new Date(date),
          adultCount,
          status: "PENDING",
          totalPrice,
          feeAmount: adminFee,
          userId: session.user.id,
        },
      });

      // Update guide finance
      const guideFinance = await prisma.guideFinance.upsert({
        where: { userId: guidePost.userId },
        update: { balance: { increment: guideEarnings } },
        create: { userId: guidePost.userId, balance: guideEarnings },
      });

      // Update guide balance
      await prisma.guideBalance.upsert({
        where: { userId: guidePost.userId },
        update: { balance: { increment: guideEarnings } },
        create: { userId: guidePost.userId, balance: guideEarnings },
      });

      // Create guide transaction
      await prisma.guideTransaction.create({
        data: {
          guideFinanceId: guideFinance.id,
          amount: guideEarnings,
          type: "CREDIT",
          description: `Earnings from booking ${booking.id} (${
            (1 - ADMIN_FEE_RATE) * 100
          }% of ${totalPrice})`,
        },
      });

      // Find admin user and update admin finance
      const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });

      if (!adminUser) {
        throw new Error("Admin user not found");
      }

      const adminFinance = await prisma.adminFinance.upsert({
        where: { userId: adminUser.id },
        update: {
          totalFees: { increment: adminFee },
          transactionCount: { increment: 1 },
          lastUpdated: new Date(),
        },
        create: {
          userId: adminUser.id,
          totalFees: adminFee,
          transactionCount: 1,
          lastUpdated: new Date(),
        },
      });

      // Create admin transaction
      await prisma.adminTransaction.create({
        data: {
          adminFinanceId: adminFinance.id,
          amount: adminFee,
          bookingId: booking.id,
          description: `Fee from booking ${booking.id}`,
        },
      });

      return { bookingId: booking.id, totalPrice };
    });

    // Create PayPal order
    const paypalOrderData = await createPayPalOrder(
      result.bookingId,
      result.totalPrice
    );

    return NextResponse.json({
      bookingId: result.bookingId,
      paypalOrderId: paypalOrderData.id,
    });
  } catch (error) {
    console.error("Error creating booking:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Error creating booking",
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: "Method not allowed" },
    {
      status: 405,
      headers: { Allow: "POST" },
    }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: "Method not allowed" },
    {
      status: 405,
      headers: { Allow: "POST" },
    }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: "Method not allowed" },
    {
      status: 405,
      headers: { Allow: "POST" },
    }
  );
}
