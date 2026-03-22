// app/api/aba-payway-return/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import axios from "axios";

export const dynamic = "force-dynamic";

const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY!;
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID!;
const BASE_URL = process.env.ABA_PAWWAY_API_URL 
  ? process.env.ABA_PAWWAY_API_URL.split('/purchase')[0].split('/checkout')[0] 
  : "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments";

const CHECK_TRANSACTION_URL = `${BASE_URL}/check-transaction-2`;

function getHash(data: string): string {
  const hmac = crypto.createHmac("sha512", ABA_PAYWAY_API_KEY);
  hmac.update(data);
  return hmac.digest("base64");
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const bookingId = searchParams.get("bookingId");
    const tran_id = searchParams.get("tran_id");

    if (!bookingId || !tran_id) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Format req_time as YYYYMMDDHHmmss
    const now = new Date();
    const req_time = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');

    // Hash Order: req_time + merchant_id + tran_id
    const hashString = req_time + ABA_PAYWAY_MERCHANT_ID + tran_id;
    const hash = getHash(hashString);

    const postData = {
      req_time,
      merchant_id: ABA_PAYWAY_MERCHANT_ID,
      tran_id,
      hash
    };

    // Verify transaction status with ABA
    const paywayResponse = await axios.post(CHECK_TRANSACTION_URL, postData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const paymentStatusCode = paywayResponse.data?.data?.payment_status_code;

    // If payment is approved (0)
    if (paymentStatusCode === 0 || paymentStatusCode === "0") {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (booking && booking.status !== "CONFIRMED") {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' },
        });

        await prisma.availability.update({
          where: {
            guidePostId_date: {
              guidePostId: booking.guidePostId,
              date: booking.date,
            },
          },
          data: { isAvailable: false },
        });
      }
      
      return NextResponse.redirect(new URL(`/booking-success?bookingId=${bookingId}`, req.url));
    } else {
      // Payment not approved
      return NextResponse.redirect(new URL(`/payment?orderId=ABA&bookingId=${bookingId}&error=payment_failed`, req.url));
    }
  } catch (error) {
    console.error("Error in ABA return endpoint:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
