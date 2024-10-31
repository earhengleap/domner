'use client'
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AOS from "aos";
import "aos/dist/aos.css";
import { CultureSkeleton } from './ui/CultureSkeleton';

interface GuidePost {
  id: string;
  title: string;
  location: string;
  fullDescription: string; 
  area: string;
  type: string;
  photos: string[];
}

const Culture: React.FC = () => {
  const [culturePosts, setCulturePosts] = useState<GuidePost[]>([]);
  const [currentPost, setCurrentPost] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    AOS.init({
      duration:800,
      once: false,
    })
    const fetchGuidePosts = async () => {
      try {
        const response = await fetch('/api/all-guide-posts');
        const data = await response.json();
        const filteredPosts = data.filter((post: GuidePost) => post.type.toLowerCase() === 'culture');
        setCulturePosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching culture guide posts:', error);
      }
    };

    fetchGuidePosts();
  }, []);

  const nextPost = () => {
    setCurrentPost((prev) => (prev + 1) % culturePosts.length);
    setShowFullDescription(false);
  };

  const prevPost = () => {
    setCurrentPost((prev) => (prev - 1 + culturePosts.length) % culturePosts.length);
    setShowFullDescription(false);
  };

  const truncateDescription = (description: string, wordLimit: number) => {
    const words = description.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return description;
  };

  if (culturePosts.length === 0) {
    return <CultureSkeleton />;
  }

  const currentCulturePost = culturePosts[currentPost];
  const truncatedDescription = truncateDescription(currentCulturePost.fullDescription, 100);

  return (
    <section className='bg-no-repeat bg-contain bg-center h-full py-12'
    style={{
      backgroundImage:
        "url(/tree1.svg), url(/tree2.svg)",
      backgroundPosition: "0% 0%, 100% 100%",
      backgroundSize: "251px 300px, 251px 300px",
    }}
    >
    <div className="text-white p-36">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-8 mb-16">
          <div 
          data-aos="fade-up-right"
          data-aos-delay="300"
          className="col-span-1 relative drop-shadow-lg">
            <div className="absolute inset-0 bg-gray-200 rounded-lg transform -rotate-3 z-0"></div>
            <div className="absolute inset-0 bg-gray-200 rounded-lg transform rotate-3 z-10"></div>
            <img
              src={currentCulturePost.photos[0] || '/api/placeholder/800/600'}
              alt={currentCulturePost.title}
              className="w-full h-full object-cover rounded-lg relative z-10"
            />
          </div>
          <div 
          data-aos='flip-left'
          data-aos-delay='300'
          className="col-span-1 pl-8 drop-shadow-lg">
            <div className="text-9xl font-bold text-gray-800 opacity-20 mb-4 text-right">Culture</div>
            <div className="text-green-600 uppercase tracking-wider mb-2">Guide Post</div>
            <h2 className="text-4xl font-bold mb-2 text-black">{currentCulturePost.title}</h2>
            <h3 className="text-2xl font-bold mb-4 text-black">{currentCulturePost.location}</h3>
            <p className="text-gray-400 mb-2">
              {showFullDescription ? currentCulturePost.fullDescription : truncatedDescription}
              {currentCulturePost.fullDescription.length > truncatedDescription.length && (
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)} 
                  className="text-green-600 ml-2 underline"
                >
                  {showFullDescription ? 'Read less' : 'Read more'}
                </button>
              )}
            </p>
            <p className="text-gray-400 mb-6">Area: {currentCulturePost.area}</p>
            <div className="flex justify-between items-center">
              <button onClick={prevPost} className="text-green-600 flex items-center">
                <ChevronLeft className="mr-2" />
                Previous
              </button>0
              <button onClick={nextPost} className="text-green-600 flex items-center">
                Next
                <ChevronRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </section>
  );
};

export default Culture;