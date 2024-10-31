import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();

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
            title: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching booking history:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}