//api/guide/finance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { hasGuideAccess } from "@/lib/access";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasGuideAccess(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guideFinance = await prisma.guideFinance.findUnique({
      where: { userId: session.user.id },
    });

    const balanceHistory = await prisma.guideTransaction.findMany({
      where: { guideFinance: { userId: session.user.id } },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });

    const formattedHistory = balanceHistory.map(transaction => ({
      date: transaction.createdAt.toISOString().split('T')[0],
      balance: transaction.amount,
      type: transaction.type,
      description: transaction.description || "",
    }));

    const monthlyTotals = new Map<string, number>();

    for (const transaction of balanceHistory) {
      const monthKey = transaction.createdAt.toISOString().slice(0, 7);
      const signedAmount =
        transaction.type === "DEBIT" ? -Math.abs(transaction.amount) : Math.abs(transaction.amount);

      monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + signedAmount);
    }

    const monthlyEarnings = Array.from(monthlyTotals.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-6)
      .map(([month, earnings]) => ({
        month,
        earnings,
      }));

    const totalCredits = balanceHistory
      .filter((transaction) => transaction.type === "CREDIT")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalDebits = balanceHistory
      .filter((transaction) => transaction.type === "DEBIT")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return NextResponse.json({
      balance: guideFinance?.balance || 0,
      history: formattedHistory,
      monthlyEarnings,
      totalCredits,
      totalDebits,
    });
  } catch (error) {
    console.error('Error fetching guide finance data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
