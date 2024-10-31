// app/api/search/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;

    console.log('Received POST search query:', query);

    if (typeof query !== 'string') {
      console.log('Invalid query parameter in POST request');
      return NextResponse.json({ error: 'Invalid query parameter' }, { status: 400 });
    }

    const guidePosts = await prisma.guidePost.findMany({
      where: {
        OR: [
          { location: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          { area: { contains: query, mode: 'insensitive' } },
          { type: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            guideProfile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    console.log('Found guide posts in POST request:', guidePosts.length);
    return NextResponse.json(guidePosts);
  } catch (error) {
    console.error('Search error in POST request:', error);
    
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('Database connection error:', error.message);
      return NextResponse.json({ error: 'Unable to connect to the database. Please try again later.' }, { status: 503 });
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma known request error:', error.message);
      return NextResponse.json({ error: 'A database error occurred. Please try again later.' }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'An unexpected error occurred while searching' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}