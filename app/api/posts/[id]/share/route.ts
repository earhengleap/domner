import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.userPost.update({
      where: { id: params.id },
      data: {
        shareCount: {
          increment: 1,
        },
      },
      select: {
        shareCount: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientValidationError)) {
      console.error("Error incrementing post share count:", error);
    }
    return NextResponse.json({ shareCount: 0 });
  }
}
