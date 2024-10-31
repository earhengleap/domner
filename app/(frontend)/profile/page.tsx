// app/profile/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import ProfileForm from "@/components/ProfileForm";
import { redirect } from "next/navigation";

async function getProfile(userId: string) {
  try {
    const profile = await prisma.user_profiles.upsert({
      where: {
        userId: userId,
      },
      update: {},
      create: {
        userId: userId,
      },
    });
    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const profile = await getProfile(session.user.id);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
        <ProfileForm 
          initialProfile={profile}
          user={{
            id: session.user.id,
            name: session.user.name || '',
            email: session.user.email || '',
          }}
        />
      </div>
    </div>
  );
}
