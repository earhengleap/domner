// components/AuthenticatedAvatar.tsx
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
import { useUser } from "@/context/UserContext";
import { useSession } from "next-auth/react";

export default function AuthenticatedAvatar({
  session: initialSession,
}: {
  session: Session | null;
}) {
  const { data: session } = useSession();
  const { userName, userEmail, userProfile } = useUser();
  const [avatarImage, setAvatarImage] = useState<string>("");

  const displayName = userName || session?.user?.name || '';
  const displayEmail = userEmail || session?.user?.email || '';

  useEffect(() => {
    // Update avatar image whenever userProfile or session changes
    const newImage = userProfile?.image || session?.user?.image || '';
    setAvatarImage(newImage);
  }, [userProfile?.image, session?.user?.image]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        <Avatar>
          <AvatarImage 
            src={avatarImage} 
            alt={displayName || "Profile"}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <p className="font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">
            {displayEmail}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/profile" className="w-full">
          <DropdownMenuItem>
            Profile
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem>
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem>
          Team
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LogoutBtn />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}