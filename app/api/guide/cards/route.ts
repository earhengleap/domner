import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'GUIDE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const card = await prisma.withdrawal.findFirst({
      where: {
        userId: session.user.id,
        method: 'BANK_TRANSFER',
        status: 'PENDING'
      },
      select: {
        id: true,
        methodDetails: true,
      }
    });

    if (!card) {
      return NextResponse.json({ card: null });
    }

    return NextResponse.json({
      card: {
        id: card.id,
        last4: (card.methodDetails as any).last4,
        expirationDate: (card.methodDetails as any).expirationDate,
      }
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'GUIDE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { number, expiry, cvv } = await req.json();

    // Basic validation
    if (!number || !expiry || !cvv) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Delete existing card if any
    await prisma.withdrawal.deleteMany({
      where: {
        userId: session.user.id,
        method: 'BANK_TRANSFER',
        status: 'PENDING'
      }
    });

    // Create new card
    const newCard = await prisma.withdrawal.create({
      data: {
        userId: session.user.id,
        amount: 0,
        method: 'BANK_TRANSFER',
        methodDetails: {
          cardType: 'CREDIT',
          last4: number.slice(-4),
          expirationDate: expiry,
        },
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      card: {
        id: newCard.id,
        last4: (newCard.methodDetails as any).last4,
        expirationDate: (newCard.methodDetails as any).expirationDate,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'GUIDE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.withdrawal.deleteMany({
      where: {
        userId: session.user.id,
        method: 'BANK_TRANSFER',
        status: 'PENDING'
      }
    });

    return NextResponse.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}