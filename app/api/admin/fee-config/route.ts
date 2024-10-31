// app/api/admin/fee-config/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();
// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";
// Types
interface FeeConfigurationResponse {
  feeRate: number;
}

interface ErrorResponse {
  message: string;
}

export async function GET(): Promise<NextResponse<FeeConfigurationResponse | ErrorResponse>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const feeConfig = await prisma.feeConfiguration.findFirst();
    
    return NextResponse.json(
      { feeRate: feeConfig?.feeRate || 0.1 },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching fee configuration:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<any | ErrorResponse>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { feeRate } = body;

    // Validate fee rate
    if (typeof feeRate !== 'number' || feeRate < 0 || feeRate > 1) {
      return NextResponse.json(
        { message: 'Invalid fee rate. Must be a number between 0 and 1' },
        { status: 400 }
      );
    }

    const updatedFee = await prisma.feeConfiguration.upsert({
      where: { id: '1' },
      update: { feeRate },
      create: { id: '1', feeRate },
    });

    return NextResponse.json(updatedFee, { status: 200 });
  } catch (error) {
    console.error('Error updating fee configuration:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'GET, POST'
      }
    }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'GET, POST'
      }
    }
  );
}