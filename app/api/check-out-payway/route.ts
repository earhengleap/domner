// File: app/api/create-booking-and-paypal-order/check-out-payway/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY!;
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID!;
const ABA_PAWWAY_API_URL = process.env.ABA_PAWWAY_API_URL!;

function getHash(data: string): string {
  const hmac = crypto.createHmac("sha512", ABA_PAYWAY_API_KEY);
  hmac.update(data);
  return hmac.digest("base64");
}

function generateTransactionId(bookingId: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const randomStr = Math.random().toString(36).substring(2, 5);
  return `${bookingId.slice(0, 8)}-${timestamp}${randomStr}`.substring(0, 20);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId } = body;
    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, name: true, email: true },
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { guidePost: { include: { user: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const guidePost = booking.guidePost;

    const req_time = Math.floor(Date.now() / 1000).toString();
    const tran_id = generateTransactionId(bookingId);
    const amount = booking.totalPrice.toFixed(2);
    const items = Buffer.from(
      JSON.stringify([{ name: guidePost.title, quantity: "1", amount }])
    ).toString("base64");
    const firstname = user.name?.split(" ")[0] || "Guest";
    const lastname = user.name?.split(" ")[1] || "";
    const email = user.email;
    const phone = "0123456789"; // Placeholder phone number
    const type = "purchase";
    const currency = "USD";
    const payment_option = "";
    const return_url = `${process.env.NEXT_PUBLIC_APP_URL}/guide/${guidePost.id}?success=1`;
    const cancel_url = `${process.env.NEXT_PUBLIC_APP_URL}/guide-posts/${guidePost.id}?canceled=1`;
    const continue_success_url = `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking.id}`;
    const return_params = "guidebooking";

    // Generate hash in the correct order
    const hashString =
      req_time +
      ABA_PAYWAY_MERCHANT_ID +
      tran_id +
      amount +
      items +
      "" + // ctid (empty if not used)
      "" + // pwt (empty if not used)
      firstname +
      lastname +
      email +
      phone +
      type +
      payment_option +
      return_url +
      cancel_url +
      continue_success_url +
      "" + // return_deeplink (empty if not used)
      currency +
      "" + // custom_fields (empty if not used)
      return_params;

    const hash = getHash(hashString);

    const response = {
      req_time,
      merchant_id: ABA_PAYWAY_MERCHANT_ID,
      tran_id,
      amount,
      items,
      firstname,
      lastname,
      email,
      phone,
      type,
      currency,
      payment_option,
      return_url,
      cancel_url,
      continue_success_url,
      return_params,
      hash,
      url: ABA_PAWWAY_API_URL,
    };

    console.log("[ABA_PAYWAY_CHECKOUT] Response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("[ABA_PAYWAY_CHECKOUT] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const dynamic = "force-dynamic";
