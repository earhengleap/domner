// File: app/api/create-booking-and-paypal-order/check-transaction-payway/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getPaywayBaseUrl, getPaywayHash, getPaywayMerchantId, getPaywayRequestTime, postPaywayMultipart } from "@/lib/payway";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tran_id } = body;

    if (!tran_id) {
      return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
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
    const paywayResponse = await postPaywayMultipart(
      `${getPaywayBaseUrl()}/check-transaction-2`,
      postData
    );

    return NextResponse.json(paywayResponse);
  } catch (error) {
    console.error("[ABA_PAYWAY_CHECK] Internal Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
