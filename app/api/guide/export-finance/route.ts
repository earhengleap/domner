//guide/finance/route.ts
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

    const transactions = await prisma.guideTransaction.findMany({
      where: { guideFinance: { userId: session.user.id } },
      orderBy: { createdAt: 'desc' },
      include: { guideFinance: true },
    });

    const csvContent = [
      'Date,Type,Amount,Description,Balance After',
      ...transactions.map(t => 
        `${t.createdAt.toISOString()},${t.type},${t.amount.toFixed(2)},${t.description},${t.guideFinance.balance.toFixed(2)}`
      )
    ].join('\n');

    const headers = new Headers();
    headers.append('Content-Type', 'text/csv');
    headers.append('Content-Disposition', 'attachment; filename=financial_report.csv');

    return new NextResponse(csvContent, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error exporting financial data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}