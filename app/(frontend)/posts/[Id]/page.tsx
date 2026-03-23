// app/posts/[postId]/page.tsx
import { PostCard } from "@/components/Posts/PostCard";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import type { Post } from "@/types/api";

interface PostPageProps {
  params: {
    Id: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const postId = params?.Id;

  if (!postId) {
    notFound();
  }

  const post = await prisma.userPost.findUnique({
    where: {
      id: postId,
    },
    select: {
      id: true,
      userId: true,
      caption: true,
      location: true,
      area: true,
      category: true,
      photos: true,
      createdAt: true,
      updatedAt: true,
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
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <PostCard
        post={{
          ...(post as unknown as Post),
          viewCount: 0,
          shareCount: 0,
          isLiked: false,
        }}
        isDetailView
      />
    </div>
  );
}
