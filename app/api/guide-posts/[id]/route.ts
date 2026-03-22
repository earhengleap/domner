// app/api/guide-posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/db';
import { authOptions } from '@/lib/authOptions';

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

function normalizeDateKey(value: Date | string) {
  const parsed = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function dateFromKey(key: string) {
  return new Date(`${key}T00:00:00.000Z`);
}

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
        bookings: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
          select: {
            id: true,
            date: true,
            status: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
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
    const lockedDates = Array.from(
      new Set(
        post.bookings
          .map((booking) => normalizeDateKey(booking.date))
          .filter((value): value is string => Boolean(value))
      )
    );

    const sanitizedPost = {
      ...post,
      lockedDates,
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
      include: {
        bookings: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
          select: {
            date: true,
          },
        },
      },
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
    const lockedDateKeys = Array.from(
      new Set(
        post.bookings
          .map((booking) => normalizeDateKey(booking.date))
          .filter((value): value is string => Boolean(value))
      )
    );

    const editableAvailability = Array.isArray(data.availability) ? data.availability : [];
    const normalizedAvailabilityMap = new Map<string, { date: Date; isAvailable: boolean }>();

    for (const lockedDateKey of lockedDateKeys) {
      normalizedAvailabilityMap.set(lockedDateKey, {
        date: dateFromKey(lockedDateKey),
        isAvailable: false,
      });
    }

    for (const entry of editableAvailability) {
      const dateKey = normalizeDateKey(entry?.date);

      if (!dateKey || normalizedAvailabilityMap.has(dateKey)) {
        continue;
      }

      normalizedAvailabilityMap.set(dateKey, {
        date: dateFromKey(dateKey),
        isAvailable: entry?.isAvailable !== false,
      });
    }

    const updatedPost = await prisma.guidePost.update({
      where: { id: postId },
      data: {
        title: data.title,
        location: data.location,
        area: data.area,
        type: data.type,
        about: data.about,
        packageOffer: data.packageOffer,
        highlight: data.highlight,
        fullDescription: data.fullDescription,
        include: data.include,
        notSuitableFor: data.notSuitableFor,
        importantInfo: data.importantInfo,
        price: typeof data.price === "number" ? data.price : Number(data.price),
        photos: Array.isArray(data.photos) ? data.photos : [],
        offlineMapUrl: data.offlineMapUrl,
        bookletUrl: data.bookletUrl,
        termsUrl: data.termsUrl,
        itinerary: {
          deleteMany: {},
          create: Array.isArray(data.itinerary)
            ? data.itinerary.map(({ title, content }: { title: string, content: string }) => ({
                title,
                content,
              }))
            : [],
        },
        availability: {
          deleteMany: {},
          create: Array.from(normalizedAvailabilityMap.values()),
        },
      },
      include: {
        itinerary: true,
        availability: true,
        bookings: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
          select: {
            id: true,
            date: true,
            status: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
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

    const sanitizedUpdatedPost = {
      ...updatedPost,
      lockedDates: Array.from(
        new Set(
          updatedPost.bookings
            .map((booking) => normalizeDateKey(booking.date))
            .filter((value): value is string => Boolean(value))
        )
      ),
    };

    console.log('Post updated successfully:', JSON.stringify(sanitizedUpdatedPost, null, 2));
    return NextResponse.json(sanitizedUpdatedPost);
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
