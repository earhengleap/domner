"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { NatureSkeleton } from "./ui/NatureSkeleton";

interface GuidePost {
  id: string;
  title: string;
  location: string;
  fullDescription: string;
  area: string;
  type: string;
  photos: string[];
}

const Nature: React.FC = () => {
  const [naturePosts, setNaturePosts] = useState<GuidePost[]>([]);
  const [currentPost, setCurrentPost] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
    });
    const fetchGuidePosts = async () => {
      try {
        const response = await fetch("/api/all-guide-posts");
        const data = await response.json();
        const filteredPosts = data.filter(
          (post: GuidePost) => post.type.toLowerCase() === "nature"
        );
        setNaturePosts(filteredPosts);
      } catch (error) {
        console.error("Error fetching nature guide posts:", error);
      }
    };

    fetchGuidePosts();
  }, []);

  const nextPost = () => {
    setCurrentPost((prev) => (prev + 1) % naturePosts.length);
    setShowFullDescription(false);
  };

  const prevPost = () => {
    setCurrentPost(
      (prev) => (prev - 1 + naturePosts.length) % naturePosts.length
    );
    setShowFullDescription(false);
  };

  const truncateDescription = (description: string, wordLimit: number) => {
    const words = description.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return description;
  };

  if (naturePosts.length === 0) {
    return <NatureSkeleton />;
  }

  const currentNaturePost = naturePosts[currentPost];
  const truncatedDescription = truncateDescription(
    currentNaturePost.fullDescription,
    100
  );

  return (
    <section
      className="relative py-8 md:py-12 bg-no-repeat bg-cover bg-bottom rounded-t-3xl drop-shadow overflow-hidden"
      style={{
        backgroundImage: "url(bannerBg.svg)",
      }}
    >
      <div className="min-h-screen px-4 sm:px-6 md:px-12 lg:px-24 xl:px-36 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 lg:mb-16">
            {/* Image Section */}
            <div
              data-aos="fade-right"
              data-aos-delay="300"
              className="relative aspect-[4/3] w-full drop-shadow-lg"
            >
              <div className="absolute inset-0 bg-gray-200 rounded-lg transform -rotate-3 z-0"></div>
              <div className="absolute inset-0 bg-gray-200 rounded-lg transform rotate-3 z-10"></div>
              <img
                src={currentNaturePost.photos[0] || "/api/placeholder/800/600"}
                alt={currentNaturePost.title}
                className="absolute inset-0 w-full h-full object-cover rounded-lg z-20"
              />
            </div>

            {/* Content Section */}
            <div
              data-aos="fade-up"
              data-aos-delay="300"
              className="lg:pl-8 drop-shadow-lg"
            >
              {/* Nature Text */}
              <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-gray-800 opacity-20 mb-4 text-right drop-shadow-3xl">
                Nature
              </div>

              {/* Guide Post Info */}
              <div className="space-y-4">
                <div className="text-green-600 uppercase tracking-wider text-sm md:text-base">
                  Guide Post
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
                  {currentNaturePost.title}
                </h2>
                <h3 className="text-xl sm:text-2xl font-bold text-black">
                  {currentNaturePost.location}
                </h3>
              </div>

              {/* Description */}
              <div className="mt-4 space-y-4">
                <p className="text-gray-400 text-sm sm:text-base">
                  {showFullDescription
                    ? currentNaturePost.fullDescription
                    : truncatedDescription}
                  {currentNaturePost.fullDescription.length >
                    truncatedDescription.length && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-green-600 ml-2 underline hover:text-green-700 transition-colors"
                    >
                      {showFullDescription ? "Read less" : "Read more"}
                    </button>
                  )}
                </p>
                <p className="text-gray-400 text-sm sm:text-base">
                  Area: {currentNaturePost.area}
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={prevPost}
                  className="text-green-600 flex items-center text-sm sm:text-base hover:text-green-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Previous
                </button>
                <button
                  onClick={nextPost}
                  className="text-green-600 flex items-center text-sm sm:text-base hover:text-green-700 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Nature;