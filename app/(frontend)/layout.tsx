
import FooterSection from "@/components/FooterSection";
import NavbarClient from "@/components/NavbarClient";

import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main>
      <NavbarClient/>
      {children}
      <FooterSection />
    </main>
  );
}
