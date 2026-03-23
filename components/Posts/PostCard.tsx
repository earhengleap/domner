'use client'

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  Link2,
  MapPinned,
  MessageCircle,
  PinIcon,
  Reply,
  TentTree,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Post } from '@/types/api';
import { LikeButton } from '../Like/LikeButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { CommentForm } from '../Comments/CommentForm';

interface PostCardProps {
  post: Post;
  isDetailView?: boolean;
}

type PostComment = {
  id: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  replies: PostComment[];
};

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

type CommentThreadItemProps = {
  comment: PostComment;
  postId: string;
  onReplySubmitted: () => void;
  depth?: number;
};

function CommentThreadItem({
  comment,
  postId,
  onReplySubmitted,
  depth = 0,
}: CommentThreadItemProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);

  return (
    <div className={depth > 0 ? 'ml-6 border-l border-[#eaded3] pl-4' : ''}>
      <div className="rounded-2xl border border-[#eaded3] bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 border border-[#eaded3]">
            <AvatarImage src={comment.user.image || undefined} />
            <AvatarFallback className="bg-[#A18167]/10 text-[#A18167] font-semibold">
              {comment.user.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#2d241d]">
                  {comment.user.name || 'Anonymous'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReplyBox((current) => !current)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b6a53] transition-colors hover:text-[#6f4e37]"
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{comment.content}</p>
          </div>
        </div>

        {showReplyBox ? (
          <div className="mt-4 rounded-xl bg-[#f8f3ed] p-3">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              placeholder={`Reply to ${comment.user.name || 'this comment'}...`}
              submitLabel="Post Reply"
              onSuccess={() => {
                setShowReplyBox(false);
                onReplySubmitted();
              }}
            />
          </div>
        ) : null}
      </div>

      {comment.replies?.length ? (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentThreadItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReplySubmitted={onReplySubmitted}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PostMedia({
  post,
  mainImage,
  isDetailView,
}: {
  post: Post;
  mainImage: string;
  isDetailView: boolean;
}) {
  const content = (
    <div className="relative aspect-[4/3] overflow-hidden">
      <Image
        src={mainImage}
        alt={post.caption}
        fill
        className={`object-cover transition-transform duration-500 ${isDetailView ? '' : 'hover:scale-[1.02]'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f4e37]">
        {formatEnumLabel(post.category)}
      </div>
      <div className="absolute left-4 bottom-4 inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-xs text-white backdrop-blur">
        <MapPinned className="h-3.5 w-3.5" />
        {formatEnumLabel(post.location)}
      </div>
    </div>
  );

  if (isDetailView) {
    return content;
  }

  return (
    <Link href={`/posts/${post.id}`} className="block">
      {content}
    </Link>
  );
}

function PostBody({ post, isDetailView }: { post: Post; isDetailView: boolean }) {
  const content = (
    <div className="space-y-3">
      <p className={`${isDetailView ? '' : 'line-clamp-3'} text-sm leading-6 text-slate-600`}>
        {post.caption}
      </p>

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#fcf8f4] p-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <TentTree className="h-4 w-4 text-[#8b6a53]" />
          <span>{formatEnumLabel(post.area)}</span>
        </div>
        <div className="flex items-center gap-2">
          <PinIcon className="h-4 w-4 text-[#8b6a53]" />
          <span>{formatEnumLabel(post.category)}</span>
        </div>
      </div>
    </div>
  );

  if (isDetailView) {
    return content;
  }

  return (
    <Link href={`/posts/${post.id}`} className="block">
      {content}
    </Link>
  );
}

export function PostCard({ post, isDetailView = false }: PostCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [shareCount, setShareCount] = useState(post.shareCount ?? 0);
  const [viewCount, setViewCount] = useState(post.viewCount ?? 0);
  const mainImage = post.photos[0] || '/default-image.png';
  const commentCount = useMemo(() => post._count.comments, [post._count.comments]);

  const {
    data: comments = [],
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useQuery<PostComment[]>({
    queryKey: ['post-comments', post.id],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/comments`);

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      return response.json();
    },
    enabled: isCommentsOpen,
  });

  useEffect(() => {
    const viewStorageKey = `post-viewed:${post.id}`;

    if (typeof window === 'undefined' || sessionStorage.getItem(viewStorageKey)) {
      return;
    }

    sessionStorage.setItem(viewStorageKey, 'true');

    void fetch(`/api/posts/${post.id}/view`, { method: 'POST' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.viewCount !== undefined) {
          setViewCount(data.viewCount);
        }
      })
      .catch((error) => {
        console.error('Failed to update post view count:', error);
      });
  }, [post.id]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/posts/${post.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Domner Post',
          text: post.caption,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }

      const response = await fetch(`/api/posts/${post.id}/share`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.shareCount !== undefined) {
          setShareCount(data.shareCount);
        }
      }
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  };

  return (
    <Card
      className={`overflow-hidden rounded-[28px] border-[#e8dbcf] bg-white shadow-[0_20px_60px_-45px_rgba(41,41,41,0.45)] ${
        isDetailView ? '' : 'transition-all hover:-translate-y-1 hover:shadow-[0_28px_90px_-45px_rgba(41,41,41,0.5)]'
      }`}
    >
      <PostMedia post={post} mainImage={mainImage} isDetailView={isDetailView} />

      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="border border-[#eaded3]">
              <AvatarImage src={post.user.image || undefined} />
              <AvatarFallback className="bg-[#A18167]/10 text-[#A18167] font-semibold">
                {post.user.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-[#2d241d]">
                {post.user.name || 'Anonymous'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f8f3ed] px-3 py-1 text-xs font-medium text-[#6f4e37]">
            <Eye className="h-3.5 w-3.5" />
            {viewCount}
          </div>
        </div>

        <PostBody post={post} isDetailView={isDetailView} />
      </CardContent>

      <CardFooter
        className={`border-t border-[#f0e4d8] px-5 py-4 ${
          isDetailView ? 'flex-col items-start gap-4' : 'flex items-center'
        }`}
      >
        <div className="flex items-center gap-2">
          <LikeButton
            postId={post.id}
            initialIsLiked={Boolean(post.isLiked)}
            likeCount={post._count.likes}
          />

          <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-[#6f4e37]">
                <MessageCircle className="h-4.5 w-4.5" />
                <span>{commentCount}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[88vh] overflow-hidden border-[#eaded3] bg-[#fffdfa] sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-[#2d241d]">Discussion</DialogTitle>
                <DialogDescription>
                  Read replies, continue the thread, and keep the conversation focused.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="max-h-[60vh] space-y-3 overflow-y-auto rounded-2xl border border-[#eaded3] bg-[#f8f3ed]/60 p-4">
                  {commentsLoading ? (
                    <p className="text-sm text-slate-500">Loading comments...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-sm text-slate-500">No comments yet. Start the discussion.</p>
                  ) : (
                    comments.map((comment) => (
                      <CommentThreadItem
                        key={comment.id}
                        comment={comment}
                        postId={post.id}
                        onReplySubmitted={() => {
                          void refetchComments();
                        }}
                      />
                    ))
                  )}
                </div>

                <div className="rounded-2xl border border-[#eaded3] bg-white p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8b6a53]">
                    Add a comment
                  </h3>
                  <div className="mt-4">
                    <CommentForm
                      postId={post.id}
                      onSuccess={() => {
                        void refetchComments();
                      }}
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-600 hover:text-[#6f4e37]"
            onClick={handleShare}
          >
            <Link2 className="h-4.5 w-4.5" />
            <span>{shareCount}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
