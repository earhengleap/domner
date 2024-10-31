import { NextResponse } from "next/server";
import db from "@/lib/db";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

type Params = {
  params: {
    id: string;
  };
};

export async function GET(
  request: Request,
  { params: { id } }: Params
): Promise<NextResponse> {
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Failed to Fetch User",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
