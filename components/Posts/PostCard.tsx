// components/Posts/PostCard.tsx
'use client'
import React, { useState } from 'react';  // Add useState import
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Heart, HouseIcon, LandPlot, MapPinned, MessageCircle, PinIcon, Share2, TentTree } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Post } from '@/types/api';
import { LikeButton } from '../Like/LikeButton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTrigger,
  DialogTitle,  // Import from ui/dialog instead of radix
} from '../ui/dialog';
import { CommentForm } from '../Comments/CommentForm';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  // Add state for managing dialog
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const mainImage = post.photos[0] || '/placeholder-image.jpg';

  return (
    <Card className="overflow-hidden">
      {/* Main Image */}
      <div className="relative aspect-square">
        <Image
          src={mainImage}
          alt={post.caption}
          fill
          className="object-cover"
          priority
        />
      </div>

      <CardContent className="p-4">
        {/* User Info */}
        <div className="flex items-center space-x-4 mb-4">
          <Avatar>
            <AvatarImage src={post.user.image || undefined} />
            <AvatarFallback>
              {post.user.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link 
              href={`/profile/${post.user.id}`}
              className="font-medium hover:underline"
            >
              {post.user.name || 'Anonymous'}
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Caption */}
        <p className="text-sm text-muted-foreground mb-2">{post.caption}</p>

        {/* Location & Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground space-x-3">
          <MapPinned className='w-4 h-4'/>
            <span>{post.location.replace(/_/g, ' ')}</span>
            <span><TentTree className='w-4 h-4'/></span>
            <span>{post.area}</span>
            <span><PinIcon className='w-4 h-4'/></span>
            <span>{post.category}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-4 py-3 border-t flex justify-between">
        <div className="flex items-center space-x-4">
          <LikeButton
            postId={post.id}
            initialIsLiked={post.isLiked}
            likeCount={post._count.likes}
          />
          
          <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="space-x-2">
                <MessageCircle />
                <span>{post._count.comments}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Comments</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <CommentForm
                  postId={post.id}
                  onSuccess={() => setIsCommentsOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Button variant="ghost" size="sm">
          <Share2 className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}