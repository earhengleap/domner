// src/components/GuideDashboard/index.tsx
'use client'
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Post {
  id: string;
  title: string;
  location: string;
  price: number;
  photos: string[];
  type: string;
  updatedAt: string;
}

export default function GuideDashboard() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchPosts();
    }
  }, [status, session, router]);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/guide-posts");
      if (response.ok) {
        const data = await response.json();
        const sortedPosts = data.sort((a: Post, b: Post) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setPosts(sortedPosts);
      } else {
        console.error("Failed to fetch guide posts");
        toast.error("Failed to load posts");
      }
    } catch (error) {
      console.error("Error fetching guide posts:", error);
      toast.error("An error occurred while loading posts");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="loader"/></div>;
  }

  return (
    <div className="p-36 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-green-800 font-normal">Your Guide Dashboard</h1>
        <div className="space-x-4">
          <Link href="/guide-dashboard/create-post">
            <Button className="bg-green-700 hover:bg-green-800 text-white">New Post</Button>
          </Link>
          <Link href="/guide-dashboard/finance">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Finance Dashboard</Button>
          </Link>
        </div>
      </div>

      <h2 className="text-xl text-green-800 font-normal mb-4">Your Posts</h2>

      {posts.map((post) => (
        <Link href={`/guide-dashboard/post/${post.id}`} key={post.id}>
          <Card className="w-full mb-4 cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-start">
                <img src={post.photos[0] || '/default-image.jpg'} alt={post.title} className="w-24 h-24 object-cover rounded-md mr-4" />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="text-gray-600">Location: {post.location}</p>
                  <p className="text-gray-600">Price: ${post.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Last updated: {new Date(post.updatedAt).toLocaleString()}</p>
                  <div className="mt-2">
                    <span className="bg-green-700 text-white px-2 py-1 rounded-full text-xs">{post.type}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
      {posts.length === 0 && <p>No posts yet</p>}
      
    </div>
  );
}
