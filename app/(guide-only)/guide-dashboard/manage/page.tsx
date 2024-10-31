// src/components/GuideDashboard/index.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { EditPostForm } from "@/components/Guide/EditPostForm";

interface GuideData {
  fullName: string;
  emailAddress: string;
  guideLicenseNumber: string;
  areaOfExpertise: string;
  yearsOfExperience: number;
}

interface Post {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  category: string;
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
  offlineMapUrl: string;
  bookletUrl: string;
  createdAt: string; 
  termsUrl: string;
  updatedAt: string;
  itinerary: Array<{ title: string; content: string }>;
}

export default function Manage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
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

  const handleEdit = async (postId: string) => {
    try {
      const response = await fetch(`/api/guide-posts/${postId}`);
      if (response.ok) {
        const post = await response.json();
        setEditingPost(post);
      } else {
        toast.error("Failed to fetch post details");
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
      toast.error("An error occurred while fetching post details");
    }
  };

  const handleEditSubmit = async (updatedPost: Post) => {
    try {
      const response = await fetch(`/api/guide-posts/${updatedPost.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPost),
      });

      if (response.ok) {
        toast.success("Post updated successfully");
        setEditingPost(null);
        fetchPosts(); // Refresh the posts list
      } else {
        toast.error("Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("An error occurred while updating the post");
    }
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`/api/guide-posts/${postId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Post deleted successfully");
          fetchPosts(); // Refresh the posts list
        } else {
          toast.error("Failed to delete post");
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("An error occurred while deleting the post");
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-36 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-green-800 font-normal">Manage Page</h1>
      </div>

      <h2 className="text-xl text-green-800 font-normal mb-4">List the Post</h2>

      {posts.map((post) => (
        <Card key={post.id} className="w-full mb-4">
          <CardContent className="p-4">
            <div className="flex items-start">
              <img src={post.image} alt={post.title} className="w-24 h-24 object-cover rounded-md mr-4" />
              <div className="flex-grow">
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-gray-600">Location: {post.location}</p>
                <p className="text-gray-600">Price: ${post.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500 ">Last updated: {new Date(post.updatedAt).toLocaleString()}</p>
                <div className="mt-2">
                  <span className="bg-green-700 text-white px-2 py-1 rounded-full text-xs">{post.category}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button onClick={() => handleEdit(post.id)} className="bg-blue-500 hover:bg-blue-600 text-white">
                  Edit
                </Button>
                <Button onClick={() => handleDelete(post.id)} className="bg-red-500 hover:bg-red-600 text-white">
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {posts.length === 0 && <p>No posts yet</p>}

      {editingPost && (
        <EditPostForm post={editingPost} onSubmit={handleEditSubmit} onCancel={() => setEditingPost(null)} />
      )}
    </div>
  );
}