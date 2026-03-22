// app/profile/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import ProfileForm from "@/components/ProfileForm";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getProfile(userId: string) {
  try {
    const profile = await prisma.userProfile.upsert({
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
    <div className="min-h-screen bg-[#fdfbf9] pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-4xl font-bold text-[#A18167] mb-2 tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your account information and preferences</p>
          <div className="mt-4">
            <Link
              href="/booking-history"
              className="inline-flex items-center rounded-xl border border-[#A18167] px-4 py-2 text-sm font-semibold text-[#A18167] transition-colors hover:bg-[#A18167] hover:text-white"
            >
              View Booking History
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl shadow-brown-100/20 border border-brown-50 overflow-hidden">
          <ProfileForm 
            initialProfile={profile}
            user={{
              id: session.user.id,
              name: session.user.name || '',
              email: session.user.email || '',
              image: session.user.image || '',
            }}
          />
        </div>
      </div>
    </div>
  );
}
