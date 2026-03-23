"use client";

import React, { useEffect, useMemo, useRef } from "react";
import SearchComponents from "@/components/Search/SearchComponents";

interface HeroProps {
  videoSrc: string;
  mainHeader: string;
  secondaryHeader: string;
}

const Hero: React.FC<HeroProps> = ({
  videoSrc,
  mainHeader,
  secondaryHeader,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const normalizedVideoSrc = useMemo(
    () => (videoSrc.startsWith("/") ? videoSrc : `/${videoSrc}`),
    [videoSrc]
  );

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.load();

    const tryPlay = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error("Hero background video failed to autoplay:", error);
      }
    };

    void tryPlay();
  }, [normalizedVideoSrc]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <video
        key={normalizedVideoSrc}
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster=""
        className="absolute inset-0 z-0 h-full w-full object-cover brightness-[0.58]"
      >
        <source src={normalizedVideoSrc} type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-10 bg-black/20" />
      <div className="absolute top-0 left-0 right-0 z-10 h-32 bg-gradient-to-b from-black/50 to-transparent" />

      <div className="absolute inset-0 z-20 flex flex-col justify-center items-center gap-2 px-4">
        <h2 className="text-white text-3xl font-bold">{mainHeader}</h2>
        <h5 className="text-white text-2xl font-semibold">
          {secondaryHeader}
        </h5>
        <h6 className="text-white text-lg font-semibold text-center">
          discover inspiring destinations, create unforgettable memories,
          <br />
          and travel with confidence - adventure starts here
        </h6>

        <SearchComponents />
      </div>
    </div>
  );
};

export default Hero;
