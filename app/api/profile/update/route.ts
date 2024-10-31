// app/api/profile/update/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/authOptions";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Update user_profiles
      const profile = await tx.user_profiles.upsert({
        where: {
          userId: session.user.id,
        },
        update: {
          username: data.username,
          dob: data.dob ? new Date(data.dob) : null,
          address: data.address,
        },
        create: {
          userId: session.user.id,
          username: data.username,
          dob: data.dob ? new Date(data.dob) : null,
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

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}