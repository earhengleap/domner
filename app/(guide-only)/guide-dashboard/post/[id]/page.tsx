// src/app/guide-dashboard/post/[id]/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface Availability {
  id: string;
  date: string;
  isAvailable: boolean;
}

interface Itinerary {
  id: string;
  title: string;
  content: string;
}

interface Post {
  id: string;
  title: string;
  location: string;
  price: number;
  area: string;
  type: string;
  about: string;
  packageOffer: string;
  highlight: string;
  fullDescription: string;
  include: string;
  notSuitableFor: string;
  importantInfo: string;
  photos: string[];
  offlineMapUrl: string | null;
  bookletUrl: string | null;
  termsUrl: string | null;
  createdAt: string;
  updatedAt: string;
  itinerary: Itinerary[];
  availability: Availability[];
}

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/guide-posts/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched post data:", JSON.stringify(data, null, 2));
          setPost(data);
        } else {
          console.error("Failed to fetch post details");
          toast.error("Failed to load post details");
        }
      } catch (error) {
        console.error("Error fetching post details:", error);
        toast.error("An error occurred while loading post details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      timeZone: 'UTC'
    });
  };

  const availableDates = post?.availability
    ?.filter(av => av.isAvailable)
    .map(av => av.date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) || [];

  useEffect(() => {
    if (post) {
      console.log("Post availability:", JSON.stringify(post.availability, null, 2));
      console.log("Available dates:", availableDates);
    }
  }, [post, availableDates]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className='loader'/></div>;
  }

  if (!post) {
    return <div className="flex justify-center items-center h-screen">Post not found</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto py-36">
      <Button onClick={() => router.back()} className="mb-4">Back to Dashboard</Button>
      
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {post.photos.map((photo, index) => (
          <img key={index} src={photo} alt={`${post.title} - Photo ${index + 1}`} className="w-full h-64 object-cover rounded-lg" />
        ))}
      </div>
      
      <div className="mb-6">
        <p className="text-xl font-semibold">Location: {post.location}</p>
        <p className="text-xl font-semibold">Price: ${post.price.toFixed(2)}</p>
        <p className="text-gray-600">Type: {post.type}</p>
        <p className="text-gray-600">Area: {post.area}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Available Dates</h2>
        {availableDates.length > 0 ? (
          <ul className="list-disc list-inside">
            {availableDates.map((date, index) => (
              <li key={index}>{formatDate(date)}</li>
            ))}
          </ul>
        ) : (
          <p>No available dates found.</p>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">About</h2>
        <p>{post.about}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Package Offer</h2>
        <p>{post.packageOffer}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Highlight</h2>
        <p>{post.highlight}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Full Description</h2>
        <p>{post.fullDescription}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Includes</h2>
        <p>{post.include}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Not Suitable For</h2>
        <p>{post.notSuitableFor}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Important Information</h2>
        <p>{post.importantInfo}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Itinerary</h2>
        {post.itinerary.map((item, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p>{item.content}</p>
          </div>
        ))}
      </div>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Additional Resources</h2>
        {post.offlineMapUrl && (
          <p><a href={post.offlineMapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Offline Map</a></p>
        )}
        {post.bookletUrl && (
          <p><a href={post.bookletUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Booklet</a></p>
        )}
        {post.termsUrl && (
          <p><a href={post.termsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms and Conditions</a></p>
        )}
      </div>
      
      <div className="text-sm text-gray-500">
        <p>Created: {formatDate(post.createdAt)}</p>
        <p>Last updated: {formatDate(post.updatedAt)}</p>
      </div>
    </div>
  );
}