import React from "react";
import News from "./News";
import PlacesCard from "./Places/PlacesCard";
import TopValues from "./Topvalue";
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
  return (
    <>
      <div className="relative h-screen w-full overflow-hidden   x">
        {/* Background Video */}
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 h-full w-full object-cover brightness-60"
        />
        
        {/* Top Gradient Overlay for Navbar Legibility */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent z-10" />

        {/* Overlay with Headers and Search Bar */}
        <div className="absolute inset-0 flex flex-col justify-center items-center gap-2 px-4">
          <h2 className="text-white text-3xl font-bold">{mainHeader}</h2>
          <h5 className="text-white text-2xl font-semibold">
            {secondaryHeader}
          </h5>
          <h6 className="text-white text-lg font-semibold text-center ">discover inspiring destinations, create unforgettable memories, <br />and travel with confidence - adventure starts here</h6>

          {/* Search Bar */}
          <SearchComponents />
        </div>
      </div>
    </>
  );
};

export default Hero;
