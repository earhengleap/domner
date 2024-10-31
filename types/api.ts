// types/api.ts
import { CambodiaProvince, PostArea, PostCategory } from '@prisma/client';
import { ReactNode } from 'react';

export type SearchType = 'all' | 'name' | 'location' | 'area' | 'category';
export interface Post {
  image: string;
  title: string;
  price: ReactNode;
  type: ReactNode;
  id: string;
  photos: string[];
  caption: string;
  location: CambodiaProvince;
  area: PostArea;
  category: PostCategory;
  createdAt: string;
  updatedAt: string;
  userId: string;
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
  isLiked?: boolean;
}
  

export interface PostsResponse {
  posts: Post[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}