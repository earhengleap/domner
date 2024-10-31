// like/post.ts
import type { Post } from '@/types/api';

export function isPostLiked(post: Post, userId: string): boolean {
  return post.likes.some(like => like.userId === userId);
}