//api/guide/finance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'GUIDE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guideFinance = await prisma.guideFinance.findUnique({
      where: { userId: session.user.id },
    });

    const balanceHistory = await prisma.guideTransaction.findMany({
      where: { guideFinance: { userId: session.user.id } },
      orderBy: { createdAt: 'desc' },
      take: 30, // Last 30 transactions
    });

    const formattedHistory = balanceHistory.map(transaction => ({
      date: transaction.createdAt.toISOString().split('T')[0],
      balance: transaction.amount,
    }));

    return NextResponse.json({
      balance: guideFinance?.balance || 0,
      history: formattedHistory,
    });
  } catch (error) {
    console.error('Error fetching guide finance data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}