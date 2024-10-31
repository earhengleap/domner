import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pending = await prisma.withdrawal.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const processed = await prisma.withdrawal.findMany({
      where: {
        status: { in: ['APPROVED', 'REJECTED'] }
      },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ pending, processed });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}