// app/posts/page.tsx

import { Posts } from "@/components/Posts/Post";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import type { Post } from "@/types/api";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PostsPage() {
  //check session 
  const session = await getServerSession(authOptions);

  if(!session){
    redirect("/login")
  }
  // Fetch posts from your database
  const post = await prisma.userPost.findFirst({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
      likes: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  });

  if (!post) {
    return (
      <div className="container py-16 max-w-7xl">
        <h1 className="text-2xl font-bold mb-6">Explore Posts</h1>
        <p>No posts found</p>
      </div>
    );
  }

  const transformedPost: Post = {
    id: post.id,
    userId: post.userId,
    caption: post.caption,
    location: post.location,
    area: post.area,
    category: post.category,
    photos: post.photos,
    image: post.photos[0] || "", // Use first photo as image
    title: post.caption || "", // Use caption as title
    price: "0", // Default price if not available
    type: post.category, // Use category as type
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    user: {
      id: post.user.id,
      name: post.user.name,
      image: post.user.image,
    },
    _count: {
      comments: post._count.comments,
      likes: post._count.likes,
    },
    likes: post.likes.map((like) => ({
      id: like.id,
      userId: like.userId,
    })),
  };

  return (
    <div className="container py-32 max-w-7xl">
      <div className="flex items-center mb-6 justify-between ">
        <h1 className="text-2xl font-bold mb-6">Explore Posts</h1>
        <Link href="/posts/create">
          <button className="mb-6 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 items-center">
            Create Post
          </button>
        </Link>
      </div>
      <Posts />
    </div>
  );
}
