// components/Posts/PostCard.tsx
'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MapPinned, MessageCircle, PinIcon, Share2, TentTree } from 'lucide-react';
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

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function PostCard({ post }: PostCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const mainImage = post.photos[0] || '/default-image.png';

  return (
    <Card className="overflow-hidden rounded-2xl border-[#e8dbcf] shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/3]">
        <Image
          src={mainImage}
          alt={post.caption}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#6f4e37]">
          {formatEnumLabel(post.category)}
        </div>
        <div className="absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur">
          <MapPinned className="h-3.5 w-3.5" />
          {formatEnumLabel(post.location)}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-4 flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={post.user.image || undefined} />
            <AvatarFallback>
              {post.user.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link 
              href={`/profile/${post.user.id}`}
              className="font-medium text-[#2d241d] hover:underline"
            >
              {post.user.name || 'Anonymous'}
            </Link>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <p className="mb-3 line-clamp-3 text-sm text-slate-600">
          {post.caption}
        </p>

        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <TentTree className='h-4 w-4 text-[#8b6a53]'/>
            <span>{formatEnumLabel(post.area)}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <PinIcon className='h-4 w-4 text-[#8b6a53]'/>
            <span>{formatEnumLabel(post.category)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t px-4 py-3 flex justify-between">
        <div className="flex items-center space-x-4">
          <LikeButton
            postId={post.id}
            initialIsLiked={Boolean(post.isLiked)}
            likeCount={post._count.likes}
          />
          
          <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="space-x-2">
                <MessageCircle className="h-5 w-5" />
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
        
        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-[#6f4e37]">
          <Share2 className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
