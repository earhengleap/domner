// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { z } from "zod";
import { Prisma, CambodiaProvince, PostArea, PostCategory } from "@prisma/client";

// Query parameters validation schema with proper enums
// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';
const querySchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('10'),
  location: z.nativeEnum(CambodiaProvince).optional(),
  area: z.nativeEnum(PostArea).optional(),
  category: z.nativeEnum(PostCategory).optional(),
  userId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['latest', 'popular', 'comments']).optional().default('latest'),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const { 
      page, 
      limit, 
      location, 
      area, 
      category,
      userId,
      search,
      sortBy 
    } = querySchema.parse(queryParams);

    // Build where clause with proper types
    const whereConditions: Prisma.UserPostWhereInput = {};

    if (location) {
      whereConditions.location = location as CambodiaProvince;
    }

    if (area) {
      whereConditions.area = area as PostArea;
    }

    if (category) {
      whereConditions.category = category as PostCategory;
    }

    if (userId) {
      whereConditions.userId = userId;
    }

    if (search) {
      whereConditions.OR = [
        { caption: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build order by
    let orderBy: Prisma.UserPostOrderByWithRelationInput = { createdAt: 'desc' };

    switch (sortBy) {
      case 'popular':
        orderBy = {
          likes: {
            _count: 'desc'
          }
        };
        break;
      case 'comments':
        orderBy = {
          comments: {
            _count: 'desc'
          }
        };
        break;
    }

    // Get total count
    const total = await prisma.userPost.count({
      where: whereConditions
    });

    // Get posts
    const posts = await prisma.userPost.findMany({
      where: whereConditions,
      take: limit,
      skip: (page - 1) * limit,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        likes: {
          where: {
            userId: session.user.id
          },
          select: {
            id: true
          }
        }
      }
    });

    return NextResponse.json({
      posts,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      }
    });

  } catch (error) {
    console.error("Error fetching posts:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid query parameters",
          details: error.errors 
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
