import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log("GET request received at /api/trips");

  const searchParams = req.nextUrl.searchParams;
  const searchTerm = searchParams.get('search') || '';
  console.log(`Search term: ${searchTerm}`);

  try {
    let guidePosts;

    if (searchTerm.length === 25 && searchTerm.startsWith('c')) {
      // This looks like an ID, so let's do a direct lookup
      console.log("Performing direct ID lookup");
      guidePosts = await prisma.guidePost.findMany({
        where: { id: searchTerm },
        select: {
          id: true,
          title: true,
          location: true,
          area: true,
          type: true,
          price: true,
          photos: true,
          user: {
            select: {
              name: true,
              guideProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              guideForm: {
                select: {
                  yearsOfExperience: true,
                  languagesSpoken: true,
                },
              },
            },
          },
          availability: {
            where: { isAvailable: true },
            orderBy: { date: 'asc' },
            take: 1,
            select: { date: true },
          },
        },
      });
    } else {
      // Perform a search query focusing on title, area, type, and location
      console.log("Performing search query for title, area, type, and location");
      guidePosts = await prisma.guidePost.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { area: { contains: searchTerm, mode: 'insensitive' } },
            { type: { contains: searchTerm, mode: 'insensitive' } },
            { location: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          location: true,
          area: true,
          type: true,
          price: true,
          photos: true,
          user: {
            select: {
              name: true,
              guideProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              guideForm: {
                select: {
                  yearsOfExperience: true,
                  languagesSpoken: true,
                },
              },
            },
          },
          availability: {
            where: { isAvailable: true },
            orderBy: { date: 'asc' },
            take: 1,
            select: { date: true },
          },
        },
      });
    }

    console.log(`Found ${guidePosts.length} guide posts`);
    console.log('Guide posts:', JSON.stringify(guidePosts, null, 2));

    const trips = guidePosts.map(post => ({
      id: post.id,
      photos: post.photos,
      title: post.title,
      guide: `${post.user.guideProfile?.firstName} ${post.user.guideProfile?.lastName}`.trim() || post.user.name || 'Unknown Guide',
      date: post.availability[0]?.date.toISOString() || "Date not specified",
      price: post.price,
      location: post.location,
      area: post.area,
      experience: post.type,
      language: post.user.guideForm?.languagesSpoken?.[0] || 'Not specified',
      yearsOfExperience: post.user.guideForm?.yearsOfExperience || 0,
      languagesSpoken: post.user.guideForm?.languagesSpoken || [],
    }));

    console.log(`Returning ${trips.length} trips`);
    console.log('Trips:', JSON.stringify(trips, null, 2));

    return NextResponse.json({ trips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json({ message: "Error fetching trips", error: (error as Error).message }, { status: 500 });
  }
}