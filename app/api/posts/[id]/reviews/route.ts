import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("GET request received for guide post ID:", params.id);

  try {
    const reviews = await prisma.review.findMany({
      where: { guidePostId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Found ${reviews.length} reviews for guide post ID:`, params.id);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("POST request received for guide post ID:", params.id);

  const session = await getServerSession(authOptions);
  console.log("Session:", session);
  console.log("Session user ID:", session?.user?.id);

  if (!session || !session.user) {
    console.log("Unauthorized: No session or user");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guidePostId = params.id;
  console.log("GuidePostId:", guidePostId);

  let bodyData;
  try {
    bodyData = await request.json();
    console.log("Request body:", bodyData);
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { content } = bodyData;

  if (!content) {
    console.log("Missing content");
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  try {
    console.log("Fetching user");
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      console.log("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Fetching guide post");
    const guidePost = await prisma.guidePost.findUnique({
      where: { id: guidePostId },
    });

    if (!guidePost) {
      console.log("Guide post not found");
      return NextResponse.json(
        { error: "Guide post not found" },
        { status: 404 }
      );
    }

    console.log("Creating review with data:", {
      content,
      userId: user.id,
      guidePostId,
    });

    const newReview = await prisma.review.create({
      data: {
        content,
        userId: user.id,
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
      },
    });

    console.log("New review created:", newReview);
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      return NextResponse.json(
        { error: `Failed to create review: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred while creating the review" },
      { status: 500 }
    );
  }
}