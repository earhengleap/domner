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

  const displayName = userName || session?.user?.name || '';
  const displayEmail = userEmail || session?.user?.email || '';
  const displayImage = userProfile?.image || session?.user?.image || '';

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        <Avatar>
          <AvatarImage 
            src={displayImage} 
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
          <DropdownMenuItem className="cursor-pointer">
            Profile
          </DropdownMenuItem>
        </Link>
        <Link href="/booking-history" className="w-full">
          <DropdownMenuItem className="cursor-pointer">
            Booking History
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="cursor-pointer">
          <LogoutBtn />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
