//api/guide-posts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/authOptions";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

// Define types for better type checking
interface ItineraryItem {
  title: string;
  content: string;
}

interface GuidePostBody {
  title: string;
  location: string;
  area: string;
  type: string;
  about?: string;
  packageOffer?: string;
  highlight?: string;
  fullDescription?: string;
  include?: string;
  notSuitableFor?: string;
  importantInfo?: string;
  price: string;
  photos?: string[];
  offlineMapUrl?: string;
  bookletUrl?: string;
  termsUrl?: string;
  itinerary: ItineraryItem[];
}

export async function GET(req: Request) {
  console.log("GET request received at /api/guide-posts");

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.guidePost.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        title: true,
        location: true,
        area: true,
        type: true,
        about: true,
        packageOffer: true,
        highlight: true,
        fullDescription: true,
        include: true,
        notSuitableFor: true,
        importantInfo: true,
        price: true,
        photos: true,
        offlineMapUrl: true,
        bookletUrl: true,
        termsUrl: true,
        createdAt: true,
        updatedAt: true,
        itinerary: {
          select: {
            title: true,
            content: true
          }
        }
      }
    });

    const formattedPosts = posts.map(post => ({
      ...post,
      image: post.photos[0] || '/default-image.jpg',
      category: post.type
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching guide posts:", error);
    return NextResponse.json({ message: "Error fetching guide posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  console.log("POST request received at /api/guide-posts");

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body: GuidePostBody = await req.json();
    console.log("Received body:", JSON.stringify(body, null, 2));

    const requiredFields: (keyof GuidePostBody)[] = ["title", "location", "area", "type", "price", "itinerary"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const price = parseFloat(body.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ message: "Invalid price" }, { status: 400 });
    }

    const post = await prisma.guidePost.create({
      data: {
        user: { connect: { id: session.user.id } },
        title: body.title,
        location: body.location,
        area: body.area,
        type: body.type,
        about: body.about || "",
        packageOffer: body.packageOffer || "",
        highlight: body.highlight || "",
        fullDescription: body.fullDescription || "",
        include: body.include || "",
        notSuitableFor: body.notSuitableFor || "",
        importantInfo: body.importantInfo || "",
        price: price,
        photos: body.photos || [],
        offlineMapUrl: body.offlineMapUrl || "",
        bookletUrl: body.bookletUrl || "",
        termsUrl: body.termsUrl || "",
        itinerary: {
          create: body.itinerary.map((item: ItineraryItem) => ({
            title: item.title,
            content: item.content,
          })),
        },
      },
      include: {
        itinerary: true,
      },
    });

    console.log("Post created successfully:", post);

    return NextResponse.json({ message: "Post created successfully", post }, { status: 201 });
  } catch (error) {
    console.error("Error creating guide post:", error);
    return NextResponse.json(
      { message: "Error creating guide post", error: (error as Error).message },
      { status: 500 }
    );
  }
}