// utils/transform-post.ts
import type { Post } from '@/types/api';
import type { UserPost } from '@prisma/client';

type PrismaPost = UserPost & {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    comments: number;
    likes: number;
  };
  likes: {
    id: string;
    userId: string;
  }[];
};

export function transformPost(post: PrismaPost): Post {
  return {
    id: post.id,
    userId: post.userId,
    caption: post.caption,
    location: post.location,
    area: post.area,
    category: post.category,
    photos: post.photos,
    image: post.photos[0] || "",
    title: post.caption || "",
    price: "0",
    type: post.category,
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
    likes: post.likes,
  };
}