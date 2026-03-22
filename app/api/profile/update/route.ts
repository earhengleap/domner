// app/api/profile/update/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate and clean up data
    const dob = data.dob && !isNaN(new Date(data.dob).getTime()) 
      ? new Date(data.dob) 
      : null;

    const updatedProfile = await prisma.$transaction(async (tx: any) => {
      // Update UserProfile
      const profile = await tx.userProfile.upsert({
        where: {
          userId: session.user.id,
        },
        update: {
          username: data.username,
          dob: dob,
          address: data.address,
        },
        create: {
          userId: session.user.id,
          username: data.username,
          dob: dob,
          address: data.address,
        },
      });

      // Update User model
      const user = await tx.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name: data.username,
        },
      });

      return { profile, user };
    });

    // Invalidate the profile page cache
    revalidatePath("/profile");

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });

  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { 
        error: "Failed to update profile", 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      },
      { status: 500 }
    );
  }
}