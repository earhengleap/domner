// components/GuideProfileAvatar.tsx
import { Session } from "next-auth";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getInitials } from "@/lib/generateInitials";
import LogoutBtn from "./LogoutBtn";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface GuideProfile {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null;
}

export default function GuideProfileAvatar({
  session: initialSession,
}: {
  session: Session | null;
}) {
  const { data: session } = useSession();
  const [guideProfile, setGuideProfile] = useState<GuideProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGuideProfile() {
      if (session?.user) {
        try {
          const response = await fetch("/api/guide-profile");
          if (response.ok) {
            const data = await response.json();
            setGuideProfile(data);
          }
        } catch (error) {
          console.error("Error fetching guide profile:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchGuideProfile();
  }, [session]);

  const displayName = guideProfile
    ? `${guideProfile.firstName} ${guideProfile.lastName}`.trim()
    : session?.user?.name || "";

  const displayEmail = guideProfile?.email || session?.user?.email || "";
  const avatarImage =
    guideProfile?.profilePicture || session?.user?.image || "";

  if (isLoading) {
    return (
      <Avatar>
        <AvatarFallback className="bg-primary/10">
          <span className="animate-pulse">...</span>
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer outline-none" asChild>
        <Avatar>
          <AvatarImage
            src={avatarImage}
            alt={displayName || "Guide Profile"}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <p className="font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">{displayEmail}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/guide-dashboard" className="w-full">
          <DropdownMenuItem>Dashboard</DropdownMenuItem>
        </Link>
        <Link href="/guide-dashboard/profile" className="w-full">
          <DropdownMenuItem>Edit Profile</DropdownMenuItem>
        </Link>
        <Link href="/guide-posts" className="w-full">
          <DropdownMenuItem>My Posts</DropdownMenuItem>
        </Link>
        <Link href="/guide/booking-history" className="w-full">
          <DropdownMenuItem>Bookings</DropdownMenuItem>
        </Link>
        <Link href="/guide-earnings" className="w-full">
          <DropdownMenuItem>Earnings</DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="w-full">
          <LogoutBtn />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
