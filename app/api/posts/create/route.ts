// app/api/posts/create/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { createServerClient } from '@/app/supabase/server';

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the request data
    const data = await req.json();
    const { photos, caption, location, area, category } = data;

    // Validate required fields
    if (!photos?.length || !caption || !location || !area || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createServerClient();

    // Verify that the photos URLs are valid
    const validPhotos = photos.filter(photo => 
      photo.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL as string) ||
      photo.startsWith('https://utfs.io')
    );

    if (validPhotos.length !== photos.length) {
      return NextResponse.json(
        { error: "Invalid photo URLs detected" },
        { status: 400 }
      );
    }

    // Create post
    const post = await prisma.userPost.create({
      data: {
        userId: session.user.id,
        photos: validPhotos,
        caption,
        location,
        area,
        category,
      },
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
      },
    });

    return NextResponse.json({
      success: true,
      post,
    });

  } catch (error) {
    console.error("Error creating post:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: "Duplicate post detected" },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: "Invalid user reference" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}