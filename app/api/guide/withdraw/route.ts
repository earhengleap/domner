import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'GUIDE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, method, methodDetails } = await req.json();
    
    // Log received data for debugging
    console.log('Received withdrawal request:', { amount, method, methodDetails });

    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
    }

    if (!method || !['BANK_TRANSFER', 'PAYPAL'].includes(method)) {
      return NextResponse.json({ error: 'Invalid withdrawal method' }, { status: 400 });
    }

    // Check balance
    const guideFinance = await prisma.guideFinance.findUnique({
      where: { userId: session.user.id },
    });

    if (!guideFinance || guideFinance.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: session.user.id,
        amount: amount,
        method: method,
        methodDetails: methodDetails,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ message: 'Withdrawal request submitted', withdrawalId: withdrawal.id });
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}