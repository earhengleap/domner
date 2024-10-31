// app/api/posts/[id]/like/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        userId: session.user.id,
        postId: params.id,
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: params.id,
        },
      });
    }

    // Get updated like count
    const updatedPost = await prisma.userPost.findUnique({
      where: {
        id: params.id,
      },
      select: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({
      isLiked: !existingLike,
      likeCount: updatedPost?._count.likes ?? 0,
    });

  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}