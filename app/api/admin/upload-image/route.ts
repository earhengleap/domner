// app/api/update-profile-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/authOptions";

// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";

// Define types
type UpdatedUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
};

type ApiResponse = {
  user?: UpdatedUser;
  message: string;
  error?: string;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { message: "Image URL is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update user's image
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json({
      user: updatedUser,
      message: "Profile image updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return NextResponse.json(
      {
        message: "An error occurred while updating the profile image",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { message: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { message: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
