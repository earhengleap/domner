// app/api/admin/dashboardStats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();
// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    const [pendingApplications, totalUsers, totalGuides, totalBookings, bookings] = await Promise.all([
      prisma.guideForm.count({ where: { status: 'PENDING' } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'GUIDE' } }),
      prisma.booking.count(),
      prisma.booking.findMany({
        select: {
          guidePost: {
            select: {
              price: true
            }
          }
        }
      }),
    ]);

    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.guidePost?.price || 0), 0);

    return NextResponse.json({
      pendingApplications,
      totalUsers,
      totalGuides,
      totalBookings,
      totalRevenue,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Error fetching dashboard stats' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}