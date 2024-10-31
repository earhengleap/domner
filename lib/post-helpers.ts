// lib/post-helpers.ts
import { Post } from '@/types/api';

export function getMainImage(post: Post): string {
  return post.photos[0] || post.image || '/placeholder-image.jpg';
}

export function formatLocation(location: string): string {
  return location.replace(/_/g, ' ');
}

export function isPostLiked(post: Post, userId: string): boolean {
  return post.likes.some(like => like.id === userId);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}
