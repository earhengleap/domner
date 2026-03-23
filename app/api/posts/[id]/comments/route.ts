// app/api/posts/[id]/comments/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { content, parentId } = await req.json();
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    let comment;

    try {
      if (parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId },
          select: { id: true, postId: true },
        });

        if (!parentComment || parentComment.postId !== params.id) {
          return NextResponse.json(
            { error: "Parent comment is invalid" },
            { status: 400 }
          );
        }
      }

      comment = await prisma.comment.create({
        data: {
          content,
          post: {
            connect: { id: params.id }
          },
          user: {
            connect: { id: session.user.id }
          },
          ...(parentId
            ? {
                parent: {
                  connect: { id: parentId },
                },
              }
            : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    } catch {
      if (parentId) {
        return NextResponse.json(
          { error: "Replies are not available yet for this database." },
          { status: 400 }
        );
      }

      comment = await prisma.comment.create({
        data: {
          content,
          post: {
            connect: { id: params.id }
          },
          user: {
            connect: { id: session.user.id }
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      comment = {
        ...comment,
        parentId: null,
        replies: [],
      };
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    try {
      const comments = await prisma.comment.findMany({
        where: {
          postId: params.id
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc"
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json(comments.filter((comment) => !comment.parentId));
    } catch {
      const comments = await prisma.comment.findMany({
        where: {
          postId: params.id
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json(
        comments.map((comment) => ({
          ...comment,
          parentId: null,
          replies: [],
        }))
      );
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
