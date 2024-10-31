import React, { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dynamic from "next/dynamic";
import { delay } from "@/lib/delay";
import HeroSection from "@/components/HeroSection";
import PlacesCard from "@/components/Places/PlacesCard";
import News from "@/components/News";
import TopValues from "@/components/Topvalue";
import Culture from "@/components/Culture";
import Nature from "@/components/Nature";
import NewsLetterSection from "@/components/NewLetterSection";

import ReviewContainer from "@/components/ReviewContainer";
import CookieConsent from "@/components/CookieConsent";


export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) {
    console.log(session?.user);
  }

  return (
    <main className="bg-white">
      <HeroSection
        videoSrc="Sequence.mp4"
        mainHeader="BorPort"
        secondaryHeader="Let's embark on your dream journey"
      />
      <PlacesCard />
      <Nature/>
      <Culture/>
      <News />
      <TopValues />
      <ReviewContainer/>
      <NewsLetterSection/>
      <CookieConsent />
    </main>
  );
}
