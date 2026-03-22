import Footer from "@/components/Guide/FooterSection";
import Navbar from "@/components/Guide/Navbar";
import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { hasGuideAccess } from "@/lib/access";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!hasGuideAccess(session.user)) {
    redirect("/");
  }

  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
