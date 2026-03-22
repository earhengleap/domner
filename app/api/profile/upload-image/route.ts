// app/api/profile/upload-image/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/authOptions";
import { supabase, serviceSupabase } from "@/app/supabase/supabaseClient";
import { revalidatePath } from "next/cache";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error: uploadError } = await serviceSupabase.storage
      .from('profiles')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName);

    const updated = await (prisma as any).$transaction(async (tx: any) => {
      const profile = await tx.userProfile.upsert({
        where: {
          userId: session.user.id,
        },
        create: {
          userId: session.user.id,
          image: publicUrl,
        },
        update: {
          image: publicUrl,
        },
      });

      const user = await tx.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          image: publicUrl,
        },
      });

      return { profile, user };
    });

    // Invalidate the profile page cache to show the new image
    revalidatePath("/profile");

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      data: updated,
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'API operation failed', 
        message: error.message,
        details: error,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}