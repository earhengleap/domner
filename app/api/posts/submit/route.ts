// app/api/posts/submit/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/db';

function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    console.log("API route started");

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    console.log("Received data:", JSON.stringify(data, null, 2));
    
    // Validate required fields
    const requiredFields = ['title', 'location', 'area', 'type', 'about', 'packageOffer', 'highlight', 'fullDescription', 'include', 'notSuitableFor', 'importantInfo', 'price'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    console.log("Creating GuidePost");
    const guidePost = await prisma.guidePost.create({
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
        price: parseFloat(data.price),
        photos: data.photos,
        offlineMapUrl: data.offlineMapUrl || '',
        bookletUrl: data.bookletUrl || '',
        termsUrl: data.termsUrl || '',
        itinerary: {
          create: data.itinerary.map((item: any) => ({
            title: item.title,
            content: item.content,
          })),
        },
        user: { connect: { id: session.user.id } },
      },
    });

    console.log("GuidePost created:", JSON.stringify(guidePost, null, 2));

    console.log("Processing Availability dates");
    console.log("Available dates received:", data.availableDates);

    const availabilityRecords = [];

    if (Array.isArray(data.availableDates) && data.availableDates.length > 0) {
      for (const dateString of data.availableDates) {
        try {
          const date = parseDate(dateString);
          console.log(`Processing date: ${date.toISOString()}`);

          const availability = await prisma.availability.create({
            data: {
              guidePostId: guidePost.id,
              date: date,
              isAvailable: true,
            },
          });

          availabilityRecords.push(availability);
          console.log(`Created availability record:`, JSON.stringify(availability, null, 2));
        } catch (error) {
          console.error(`Error creating availability for date ${dateString}:`, error);
        }
      }
      console.log(`Finished processing ${data.availableDates.length} availability dates`);
    } else {
      console.log("No availability dates provided");
    }

    console.log("All operations completed successfully");
    return NextResponse.json({ 
      message: 'Guide post created successfully', 
      guidePost,
      availabilities: availabilityRecords
    });
  } catch (error) {
    console.error('Error creating guide post:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
  }
}