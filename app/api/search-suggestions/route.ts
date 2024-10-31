// app/api/search-suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";
import { cache } from 'react';

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

// Cache the search results for 5 minutes
const getCachedResults = cache(async (query: string) => {
  return await prisma.guidePost.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
        { area: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      title: true,
      location: true,
      price: true,
      photos: true,
      type: true,
      about: true,
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
    take: 5,
    orderBy: [
      { title: 'asc' },
      { createdAt: 'desc' },
    ],
  });
});

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('q')?.trim() || '';

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await getCachedResults(query);

    const formattedSuggestions = suggestions.map(suggestion => ({
      id: suggestion.id,
      title: suggestion.title,
      location: suggestion.location,
      price: suggestion.price,
      photos: suggestion.photos,
      guide: `${suggestion.user.guideProfile?.firstName} ${suggestion.user.guideProfile?.lastName}`.trim() || suggestion.user.name,
      experience: suggestion.type,
      description: suggestion.about,
    }));

    return NextResponse.json({ 
      suggestions: formattedSuggestions,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch search suggestions" }, 
      { status: 500 }
    );
  }
}