// app/api/guide-posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/db';
import { authOptions } from '@/lib/authOptions';

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`GET request received for post ID: ${params.id}`);
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('Authenticated user:', session.user.id);

    const postId = params.id;

    console.log('Fetching post from database...');
    const post = await prisma.guidePost.findUnique({
      where: { id: postId },
      include: { 
        itinerary: true,
        availability: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            guideProfile: {
              select: {
                firstName: true,
                lastName: true,
                description: true,
              }
            }
          }
        }
      }
    });

    if (!post) {
      console.log(`Post not found for ID: ${postId}`);
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Remove sensitive information from the user object
    const sanitizedPost = {
      ...post,
      user: {
        ...post.user,
        email: undefined, // Remove email from the response
      }
    };

    console.log('Post fetched successfully:', JSON.stringify(sanitizedPost, null, 2));
    return NextResponse.json(sanitizedPost);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ message: 'Error fetching post' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`PUT request received for post ID: ${params.id}`);
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;
    const data = await req.json();

    console.log('Fetching post to update...');
    const post = await prisma.guidePost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      console.log(`Post not found for ID: ${postId}`);
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (post.userId !== session.user.id) {
      console.log('Unauthorized update attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    console.log('Updating post...');
    const updatedPost = await prisma.guidePost.update({
      where: { id: postId },
      data: data,
      include: {
        itinerary: true,
        availability: true,
        user: {
          select: {
            id: true,
            name: true,
            guideProfile: {
              select: {
                firstName: true,
                lastName: true,
                description: true,
              }
            }
          }
        }
      }
    });

    console.log('Post updated successfully:', JSON.stringify(updatedPost, null, 2));
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ message: 'Error updating post' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`DELETE request received for post ID: ${params.id}`);
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;

    console.log('Fetching post to delete...');
    const post = await prisma.guidePost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      console.log(`Post not found for ID: ${postId}`);
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (post.userId !== session.user.id) {
      console.log('Unauthorized delete attempt');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    console.log('Deleting post...');
    await prisma.guidePost.delete({
      where: { id: postId },
    });

    console.log('Post deleted successfully');
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ message: 'Error deleting post' }, { status: 500 });
  }
}