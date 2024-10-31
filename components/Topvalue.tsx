"use client";
import React, { useEffect, useState } from "react";
import { BsGlobeAmericas } from "react-icons/bs";
import { BiWalk } from "react-icons/bi";
import { MdPayments } from "react-icons/md";
import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";
import { TopValuesSkeleton } from "./ui/TopValuesSkeleton";

const ImageLink = "https://ik.imagekit.io/imgkitt/andrew-wulf-IeMpDqtdLL8-unsplash%20(1).jpg?updatedAt=1698394088097";

const vid = "https://ik.imagekit.io/imgkitt/production_id_4662765%20(1080p).mp4?updatedAt=1698431795982";

const data = [
  {
    id: 1,
    icon: <BsGlobeAmericas className="text-green-800" size={35} />,
    title: "Lot Of Choices",
    details: "Total 500+ Destinations that we work with",
    link: "",
  },
  {
    id: 2,
    icon: <BiWalk className="text-green-800" size={38} />,
    title: "Best Tour Guide",
    details: "Our Tour guide with 5+ years of experience",
    link: "",
  },
  {
    id: 3,
    icon: <MdPayments className="text-green-800" size={38} />,
    title: "Easy Booking",
    details: "With an easy and fast ticket purchase process",
    link: "",
  },
];

const TopValues = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
    });
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <TopValuesSkeleton />;
  }

  return (
    <section 
      className="relative bg-no-repeat  px-4 py-2 md:py-12 lg:py-16"
      style={{
      backgroundImage: "url(/manDirect.svg)",
      backgroundPosition: "130% 90%",
      backgroundSize: "50% 60%",
    }}>
    
      <div
        data-aos="zoom-out"
        data-aos-delay="200"
        className="max-w-6xl mx-auto w-full flex flex-col gap-6 md:gap-8 lg:gap-12"
      >
        <div className="w-full space-y-2 md:space-y-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-center">
            Top Values From Us For You
          </h2>
          <p className="text-base md:text-lg lg:text-xl font-medium text-gray-400 text-center max-w-2xl mx-auto">
            Try a variety of benefits when using our services
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
          {data?.map((i) => (
            <div
              key={i.id}
              className="h-full flex flex-col items-center gap-4 text-center"
            >
              <span className="border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                {i.icon}
              </span>
              <h2 className="text-xl md:text-2xl font-semibold">{i.title}</h2>
              <p className="text-sm md:text-base text-gray-500 max-w-[280px]">
                {i.details}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopValues;
