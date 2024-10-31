// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from '@/lib/db';

// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'GUIDE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const registrationData = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      where: {
        role: 'GUIDE',
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    });

    const formattedRegistrationData = registrationData.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id,
    }));

    return NextResponse.json({
      users,
      registrationData: formattedRegistrationData,
    });
  } catch (error) {
    console.error('Error fetching users data:', error);
    return NextResponse.json({ error: 'Error fetching users data' }, { status: 500 });
  }
}