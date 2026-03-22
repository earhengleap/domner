// File: app/api/create-booking-and-paypal-order/check-out-payway/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import axios from "axios";

const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY!;
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID!;
const ABA_PAWWAY_API_URL = process.env.ABA_PAWWAY_API_URL;
const ABA_PAYWAY_CURRENCY = process.env.ABA_PAYWAY_CURRENCY || "USD";
const ABA_PAYWAY_RETURN_PARAMS = process.env.ABA_PAYWAY_RETURN_PARAMS || "guidebooking";

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

    // Format req_time as YYYYMMDDHHmmss
    const now = new Date();
    const req_time = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');

    const tran_id = generateTransactionId(bookingId);
    const amount = booking.totalPrice.toFixed(2);
    const firstname = user.name?.split(" ")[0] || "Guest";
    const lastname = user.name?.split(" ")[1] || "";
    const email = user.email;
    const phone = process.env.ABA_PAYWAY_PHONE_PLACEHOLDER || "0123456789";
    const purchase_type = "purchase";
    const currency = ABA_PAYWAY_CURRENCY;
    const payment_option = "abapay_khqr"; // Correct value for KHQR/ABA PAY generation
    const lifetime = 5; // 5 minutes
    const qr_image_template = "template3_color";
    const payout = "";

    // RAW values for hash
    const raw_items = JSON.stringify([{ name: guidePost.title, quantity: "1", price: amount }]);
    const raw_callback_url = `${process.env.NEXT_PUBLIC_APP_URL}/guide/${guidePost.id}?success=1`;
    const raw_continue_success_url = `${process.env.NEXT_PUBLIC_APP_URL}/api/aba-payway-return?bookingId=${booking.id}&tran_id=${tran_id}`;

    const items = Buffer.from(raw_items).toString("base64");
    const callback_url = Buffer.from(raw_callback_url).toString("base64");
    const return_deeplink = "";
    const custom_fields = "";
    const return_params = ABA_PAYWAY_RETURN_PARAMS;

    const hashString =
      req_time +
      ABA_PAYWAY_MERCHANT_ID +
      tran_id +
      amount +
      items +
      firstname +
      lastname +
      email +
      phone +
      purchase_type +
      payment_option +
      callback_url +
      return_deeplink +
      currency +
      custom_fields +
      return_params +
      payout +
      lifetime +
      qr_image_template;

    const hash = getHash(hashString);

    const postData = {
      req_time,
      merchant_id: ABA_PAYWAY_MERCHANT_ID,
      tran_id,
      amount,
      items,
      first_name: firstname,
      last_name: lastname,
      email,
      phone,
      purchase_type,
      payment_option,
      callback_url,
      return_deeplink,
      currency,
      custom_fields,
      return_params,
      payout,
      lifetime,
      qr_image_template,
      hash
    };

    const apiUrl = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/generate-qr";

    try {
      const paywayResponse = await axios.post(apiUrl, postData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("[ABA_PAYWAY_CHECKOUT] PayWay API Response:", paywayResponse.data);

      return NextResponse.json({
        ...paywayResponse.data,
        amount, 
        success: paywayResponse.data.status?.code === '0' || paywayResponse.data.status?.code === '00'
      });
    } catch (paywayError: any) {
      console.error("[ABA_PAYWAY_CHECKOUT] PayWay API Error:", paywayError.response?.data || paywayError.message);
      return NextResponse.json(
        { error: "Failed to communicate with PayWay API", details: paywayError.response?.data || paywayError.message },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("[ABA_PAYWAY_CHECKOUT] Internal Error:", error);
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
