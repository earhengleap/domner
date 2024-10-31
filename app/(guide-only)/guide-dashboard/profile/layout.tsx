// app/profile/layout.tsx
import React from "react";
import prisma from "@/lib/db"; // Adjust this import path as needed

async function getUserName(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  return user?.name || "GUIDE";
}

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100 py-16 justify-center items-center">
      <div className="w-3/4 p-8">{children}</div>
    </div>
  );
}
