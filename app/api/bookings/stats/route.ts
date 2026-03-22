import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        status: true,
        totalPrice: true,
      },
    });

    const stats = bookings.reduce(
      (acc, booking) => {
        if (booking.status === "PENDING") acc.pending += 1;
        if (booking.status === "CONFIRMED") acc.confirmed += 1;
        if (booking.status === "CANCELLED") {
          acc.cancelled += 1;
          return acc;
        }

        acc.total += 1;
        acc.totalSpent += booking.totalPrice;

        return acc;
      },
      {
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        totalSpent: 0,
      }
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
