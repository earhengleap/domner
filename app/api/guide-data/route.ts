// File: app/api/guide-data/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic'
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guideData = await prisma.guideForm.findUnique({
      where: { userId: session.user.id },
      select: {
        fullName: true,
        emailAddress: true,
        guideLicenseNumber: true,
        areaOfExpertise: true,
        yearsOfExperience: true,
        status: true,
      }
    });

    if (!guideData) {
      return NextResponse.json({ error: 'Guide data not found' }, { status: 404 });
    }

    return NextResponse.json(guideData);
  } catch (error) {
    console.error('Error fetching guide data:', error);
    return NextResponse.json({ error: 'An error occurred while fetching guide data' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}