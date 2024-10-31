// app/api/reviews/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get guidePostId from query parameters
    const { searchParams } = new URL(request.url);
    const guidePostId = searchParams.get('guidePostId');

    if (!guidePostId) {
      return NextResponse.json(
        { error: 'Guide post ID is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        guidePostId: guidePostId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        guidePost: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, guidePostId } = await req.json();

    // Validate input
    if (!content || content.length > 500) {
      return NextResponse.json(
        { error: 'Content must be between 1 and 500 characters' },
        { status: 400 }
      );
    }

    if (!guidePostId) {
      return NextResponse.json(
        { error: 'Guide post ID is required' },
        { status: 400 }
      );
    }

    // Check if guidePost exists
    const guidePost = await prisma.guidePost.findUnique({
      where: { id: guidePostId },
    });

    if (!guidePost) {
      return NextResponse.json(
        { error: 'Guide post not found' },
        { status: 404 }
      );
    }

    const review = await prisma.review.create({
      data: {
        content,
        userId: session.user.id,
        guidePostId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        guidePost: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}