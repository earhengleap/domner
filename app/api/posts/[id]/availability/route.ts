// File: app/api/posts/[id]/availability/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const postId = params.id;

    const availability = await prisma.availability.findMany({
      where: {
        guidePostId: postId,
        isAvailable: true,
      },
      select: {
        date: true,
      },
    });

    return NextResponse.json({
      availability: availability.map(a => a.date.toISOString()),
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { message: "Error fetching availability", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}