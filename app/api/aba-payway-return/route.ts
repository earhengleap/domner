// app/api/aba-payway-return/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getPaywayBaseUrl, getPaywayHash, getPaywayMerchantId, getPaywayRequestTime, postPaywayMultipart } from "@/lib/payway";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const bookingId = searchParams.get("bookingId");
    const tran_id = searchParams.get("tran_id");

    if (!bookingId || !tran_id) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const req_time = getPaywayRequestTime();
    const merchant_id = getPaywayMerchantId();
    const hash = getPaywayHash([req_time, merchant_id, tran_id]);

    const postData = {
      req_time,
      merchant_id,
      tran_id,
      hash
    };

    // Verify transaction status with ABA
    const paywayResponse = await postPaywayMultipart(
      `${getPaywayBaseUrl()}/check-transaction-2`,
      postData
    );

    const paymentStatusCode = paywayResponse?.data?.payment_status_code;

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
