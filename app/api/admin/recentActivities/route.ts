// app/api/admin/recentActivities/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

// Add this export to mark the route as dynamic
export const dynamic = "force-dynamic";
type ActivityRaw = {
  id: string;
  type: string;
  description: string;
  date: Date;
};

type Activity = {
  id: string;
  type: string;
  description: string;
  date: string;
};

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const recentActivities = await prisma.$queryRaw<ActivityRaw[]>`
      (SELECT 
        id::text, 
        'application' as type, 
        concat('New guide application: ', "fullName") as description, 
        "createdAt" as date
      FROM "GuideForm"
      ORDER BY "createdAt" DESC
      LIMIT 5)
      
      UNION ALL
      
      (SELECT 
        b.id::text, 
        'booking' as type, 
        concat('New booking: ', u.name, ' booked ', gp.title) as description, 
        b."createdAt" as date
      FROM "Booking" b
      JOIN "User" u ON b."userId" = u.id
      JOIN "GuidePost" gp ON b."guidePostId" = gp.id
      ORDER BY b."createdAt" DESC
      LIMIT 5)
      
      UNION ALL
      
      (SELECT 
        id::text, 
        'new_guide_post' as type, 
        concat('New guide post: ', title, ' by ', (SELECT name FROM "User" WHERE id = "GuidePost"."userId")) as description, 
        "createdAt" as date
      FROM "GuidePost"
      ORDER BY "createdAt" DESC
      LIMIT 5)
      
      UNION ALL
      
      (SELECT 
        id::text, 
        'new_user' as type, 
        concat('New user registered: ', name) as description, 
        "createdAt" as date
      FROM "User"
      ORDER BY "createdAt" DESC
      LIMIT 5)
      
      UNION ALL
      
      (SELECT 
        w.id::text, 
        'withdrawal' as type, 
        concat('Withdrawal request: $', w.amount::text, ' by ', u.name) as description, 
        w."createdAt" as date
      FROM "Withdrawal" w
      JOIN "User" u ON w."userId" = u.id
      ORDER BY w."createdAt" DESC
      LIMIT 5)
      
      ORDER BY date DESC
      LIMIT 20
    `;

    const activities: Activity[] = recentActivities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      date: activity.date.toISOString(),
    }));

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    if (
      error instanceof Error &&
      error.message.includes("Can't reach database server")
    ) {
      return NextResponse.json(
        {
          error:
            "Unable to connect to the database. Please check your database connection.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
