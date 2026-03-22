import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";
export async function GET(req: Request) {

  try {
    const posts = await prisma.guidePost.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      location: post.location,
      area: post.area,
      type: post.type,
      fullDescription: post.fullDescription,
      photos: post.photos || [],
    }));


    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching all guide posts:", error);
    return NextResponse.json(
      { message: "Error fetching all guide posts" },
      { status: 500 }
    );
  }
}
