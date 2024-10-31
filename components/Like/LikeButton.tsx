// components/Like/LikeButton.tsx
'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface LikeButtonProps {
  postId: string;
  initialIsLiked: boolean;
  likeCount: number;
}

export function LikeButton({ postId, initialIsLiked, likeCount }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);
  const queryClient = useQueryClient();

  const { mutate: toggleLike, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }
      return response.json();
    },
    onMutate: async () => {
      // Optimistic update
      setIsLiked(!isLiked);
      setCurrentLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    },
    onError: (error) => {
      // Revert on error
      setIsLiked(initialIsLiked);
      setCurrentLikeCount(likeCount);
      toast.error('Failed to update like');
    },
    onSettled: () => {
      // Refetch posts to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleLike()}
      disabled={isPending}
      className="group"
    >
      <Heart 
        className={`h-5 w-5 mr-1.5 transition-colors
          ${isLiked ? 'fill-red-500 stroke-red-500' : 'stroke-foreground group-hover:fill-red-500/20'}
        `}
      />
      <span>{currentLikeCount}</span>
    </Button>
  );
}