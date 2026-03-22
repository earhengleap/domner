// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Poppins } from "next/font/google";
import "../app/globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "react-hot-toast";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import QueryProvider from "@/providers/query-provider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "Domner | Your Gateway to Authentic Cambodia",
  description: "Explore the beauty of Cambodia with Domner. Discover hidden gems, book professional local guides, and experience authentic eco-tourism in the heart of Southeast Asia.",
  keywords: [
    "Cambodia Travel", "Eco-tourism Cambodia", "Professional Tour Guides",
    "Angkor Wat Tours", "Authentic Cambodia", "Domner Platform",
    "Next.js", "React", "Supabase", "Prisma", "Tailwind CSS"
  ],
  authors: [
    { name: "Hor Kimly", url: "/about-us" },
    { name: "Chea Bunthay", url: "/about-us" },
    { name: "Khiev Piseth", url: "/about-us" },
    { name: "Hengleap EAR", url: "Unknown" } // Primary Developer & Technical Contributor
  ],
  creator: "Hengleap EAR & Domner Team",
  publisher: "Domner Platform",
  icons: {
    icon: "/favicon-square.png",
    apple: "/favicon-square.png",
  },
  openGraph: {
    type: "website",
    locale: "en_KH",
    url: "/",
    siteName: "Domner",
    title: "Domner | Your Gateway to Authentic Cambodia",
    description: "Discover curated travel experiences and expert local guides in Cambodia.",
    images: [{ url: "/Kampot.jpg", width: 1200, height: 630, alt: "Domner Cambodia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Domner | Authentic Cambodia",
    description: "Discover hidden gems and book expert guides in Cambodia.",
    images: ["/Kampot.jpg"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthProvider session={session}>
          <QueryProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
