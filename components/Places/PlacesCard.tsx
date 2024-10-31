"use client";

import React, { useEffect, useState } from "react";
import "./Places.css";
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HighlightText from "../HighlightText";
import LoadImage from "../LoadImage";
import { DestinationSkeleton } from "../ui/DestinationCardsLoadingSkeleton";

interface GuidePost {
  id: string;
  title: string;
  location: string;
  area: string;
  type: string;
  photos: string[];
}

const PlacesCard: React.FC = () => {
  const [guidePosts, setGuidePosts] = useState<GuidePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
    });

    const fetchGuidePosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/all-guide-posts");
        if (!response.ok) {
          throw new Error("Failed to fetch guide posts");
        }
        const data = await response.json();
        console.log("Fetched guide posts:", data);
        setGuidePosts(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching guide posts:", error);
        setError("Failed to load guide posts. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuidePosts();
  }, []);

  if (isLoading) {
    return <DestinationSkeleton />;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (guidePosts.length === 0) {
    return (
      <div className="no-posts">No guide posts available at the moment.</div>
    );
  }

  const getImageSrc = (post: GuidePost) => {
    if (post.photos && post.photos.length > 0) {
      console.log(`Image URL for ${post.title}:`, post.photos[0]);
      return post.photos[0];
    }
    console.log(`No image for ${post.title}, using default`);
    return "/default-image.jpg";
  };

  const handlePostClick = (postId: string) => {
    router.push(`/guide/${postId}`);
  };

  return (
    <div className="places-card-wrapper ">
      <h2 className="lg:text-4xl md:text-4xl text-3xl whitespace-normal mb-8">
        <HighlightText> Popular</HighlightText> Destination
        <LoadImage
          src="/underline.svg"
          alt="arrow"
          height={7}
          width={275}
          className="mt-1.5"
        />
      </h2>
      <div className="container-box">
        {guidePosts.length > 0 && (
          <div
            className="featured-place"
            data-aos="fade-up"
            onClick={() => handlePostClick(guidePosts[0].id)}
            style={{ cursor: "pointer" }}
          >
            <Image
              src={getImageSrc(guidePosts[0])}
              alt={guidePosts[0].title}
              width={400}
              height={300}
              className="place-image"
            />
            <div className="place-info">
              <h3 className="place-name">{guidePosts[0].title}</h3>
              <span className="place-location">{guidePosts[0].location}</span>
              <span
                className={`place-type ${guidePosts[0].type.toLowerCase()}`}
              >
                {guidePosts[0].type}
              </span>
            </div>
          </div>
        )}
        <div className="secondary-places">
          {guidePosts.length > 1 && (
            <div
              className="left-card"
              data-aos="fade-up"
              onClick={() => handlePostClick(guidePosts[1].id)}
              style={{ cursor: "pointer" }}
            >
              <Image
                src={getImageSrc(guidePosts[1])}
                alt={guidePosts[1].title}
                width={400}
                height={300}
                className="place-image"
              />
              <div className="place-info">
                <h3 className="place-name">{guidePosts[1].title}</h3>
                <span className="place-location">{guidePosts[1].location}</span>
                <span
                  className={`place-type ${guidePosts[1].type.toLowerCase()}`}
                >
                  {guidePosts[1].type}
                </span>
              </div>
            </div>
          )}
          <div className="right-cards">
            {guidePosts.slice(2, 4).map((post) => (
              <div
                key={post.id}
                className="place-card"
                data-aos="fade-up"
                onClick={() => handlePostClick(post.id)}
                style={{ cursor: "pointer" }}
              >
                <Image
                  src={getImageSrc(post)}
                  alt={post.title}
                  width={400}
                  height={300}
                  className="place-image"
                />
                <div className="place-info">
                  <h3 className="place-name">{post.title}</h3>
                  <span className="place-location">{post.location}</span>
                  <span className={`place-type ${post.type.toLowerCase()}`}>
                    {post.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacesCard;
