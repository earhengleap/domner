// app/api/guide-profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";
import { authOptions } from "@/lib/authOptions";
import { createClient } from "@supabase/supabase-js";

// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Utility function to validate session
async function validateSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "GUIDE") {
    throw new Error("Access denied. Guide role required.");
  }

  return session;
}

// Utility function to delete file from Supabase
async function deleteFromSupabase(url: string) {
  if (!url) return;
  const fileName = url.split("/").pop();
  if (fileName) {
    await supabase.storage.from("guide-profiles").remove([fileName]);
  }
}

export async function GET(req: Request) {
  try {
    const session = await validateSession();

    let guideProfile = await prisma.guideProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!guideProfile) {
      guideProfile = await prisma.guideProfile.create({
        data: {
          userId: session.user.id,
          firstName: session.user.name?.split(" ")[0] || "",
          lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
          email: session.user.email || "",
          phoneNumber: "",
          description: "",
          profilePicture: null,
          facebookLink: "",
          tiktokLink: "",
          twitterLink: "",
          telegramLink: "",
        },
      });
    }

    return NextResponse.json(guideProfile);
  } catch (error) {
    console.error("Error in GET /api/guide-profile:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await validateSession();

    const formData = await req.formData();
    const profileImage = formData.get("profileImage") as File | null;
    const profileData = JSON.parse(formData.get("data") as string);

    let profilePictureUrl = profileData.profilePicture;

    // Handle image upload if a new image is provided
    if (profileImage) {
      // Validate file type
      if (!profileImage.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Invalid file type. Please upload an image." },
          { status: 400 }
        );
      }

      // Validate file size (5MB)
      if (profileImage.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image size should be less than 5MB" },
          { status: 400 }
        );
      }

      try {
        // Delete old image if exists
        if (profilePictureUrl) {
          await deleteFromSupabase(profilePictureUrl);
        }

        // Upload new image
        const fileExt = profileImage.type.split("/")[1];
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("guide-profiles")
          .upload(fileName, profileImage, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("guide-profiles").getPublicUrl(fileName);

        profilePictureUrl = publicUrl;
      } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    // Update database
    const result = await prisma.$transaction(async (prisma) => {
      const updatedProfile = await prisma.guideProfile.upsert({
        where: { userId: session.user.id },
        update: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phoneNumber: profileData.phoneNumber,
          description: profileData.description,
          profilePicture: profilePictureUrl,
          facebookLink: profileData.facebookLink,
          tiktokLink: profileData.tiktokLink,
          twitterLink: profileData.twitterLink,
          telegramLink: profileData.telegramLink,
        },
        create: {
          userId: session.user.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: session.user.email || "",
          phoneNumber: profileData.phoneNumber,
          description: profileData.description,
          profilePicture: profilePictureUrl,
          facebookLink: profileData.facebookLink,
          tiktokLink: profileData.tiktokLink,
          twitterLink: profileData.twitterLink,
          telegramLink: profileData.telegramLink,
        },
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: `${profileData.firstName} ${profileData.lastName}`.trim(),
          image: profilePictureUrl,
        },
      });

      return updatedProfile;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/guide-profile:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await validateSession();

    const profile = await prisma.guideProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.profilePicture) {
      await deleteFromSupabase(profile.profilePicture);
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.guideProfile.update({
        where: { userId: session.user.id },
        data: { profilePicture: null },
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: null },
      });
    });

    return NextResponse.json({
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/guide-profile:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
