// app/posts/[postId]/page.tsx
import { PostCard } from "@/components/Posts/PostCard";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";

interface PostPageProps {
  params: {
    postId: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = params;

  const post = await prisma.userPost.findUnique({
    where: {
      id: postId,
    },
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
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Post Details</h1>
      <PostCard post={transporter} />
    </div>
  );
}