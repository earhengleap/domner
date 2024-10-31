"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { NewsSkeleton } from "./ui/NewsSkeleton";

const News: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
    });
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <NewsSkeleton />;
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 0,
          slidesToScroll: 0,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const newsItems = [
    {
      date: "1 Jan 2023",
      title: "KohKong Province",
      description: `Enjoy breath-taking views of the mountains, stroll through the mangrove forests of Chi Pat, and venture into the depths of Areng Valley.`,
      tag: "Nature",
      imageUrl: "kohkong02.png",
      link: "/news-detail/kohkong",
    },
    {
      date: "2 Feb 2023",
      title: "Siem Reap",
      description: `Experience the ancient wonders of Angkor Wat, explore vibrant local markets, and enjoy the lively atmosphere of this cultural hub.`,
      tag: "Culture",
      imageUrl: "sr.png",
      link: "/news-detail/siem-reap",
    },
    {
      date: "15 Mar 2023",
      title: "Takeo",
      description: `Takeo, in southern Cambodia, is a historic province with ancient temples and tranquil lakes. Known for its cultural heritage and rural charm.`,
      tag: "Nature ",
      imageUrl: "takeo01.jpg",
      link: "/news-detail/takeo-province",
    },
    {
      date: "15 Mar 2023",
      title: "Mondulkiri",
      description: `Mondulkiri, in eastern Cambodia, is a tranquil, scenic province known for its lush hills, forests, and spectacular Bou Sra Waterfall.  `,
      tag: "Nature",
      imageUrl: "mondolkiri.jpg",
      link: "/news-detail/mondulkiri-province",
    },
    {
      date: "15 Mar 2023",
      title: "Kampot",
      description: `Kampot, in southern Cambodia, is a charming riverside province known for its beautiful landscapes, iconic pepper plantations.`,
      tag: "Nature",
      imageUrl: "kp.png",
      link: "/news-detail/kampot-province",
    },
    {
      date: "15 Mar 2023",
      title: "Kompong Speu",
      description: `Kompong Speu, in central Cambodia, is a scenic province known for its rugged landscapes, traditional sugar palm production.`,
      tag: "Nature",
      imageUrl: "speu.png",
      link: "/news-detail/kampong-speu",
    },

    
  ];

  return (
    <section className="rounded-3xl">
      <div className="py-10 max-w-6xl mx-auto">
        <h2
          data-aos="fade-down"
          delay-aos="300"
          className="text-4xl font-bold text-center mb-8"
        >
          News
        </h2>
        <Slider {...settings}>
          {newsItems.map((item, index) => (
            <div key={index} className="p-4 max-w-3xl">
              <Link href={item.link} className="block">
                <div
                  data-aos="zoom-in-down"
                  delay-aos="300"
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm text-green-700">{item.date}</p>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 mt-2">{item.description}</p>
                    <span className="inline-block bg-green-600 text-white text-xs font-bold px-3 py-1 mt-4 rounded-full">
                      {item.tag}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default News;
