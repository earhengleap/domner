// File: app/api/create-booking-and-paypal-order/check-transaction-payway/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";

const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY!;
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID!;
// Base URL for sandbox, can be overridden by env
const BASE_URL = process.env.ABA_PAWWAY_API_URL 
  ? process.env.ABA_PAWWAY_API_URL.split('/purchase')[0] 
  : "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments";

const CHECK_TRANSACTION_URL = `${BASE_URL}/check-transaction-2`;

function getHash(data: string): string {
  const hmac = crypto.createHmac("sha512", ABA_PAYWAY_API_KEY);
  hmac.update(data);
  return hmac.digest("base64");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tran_id } = body;

    if (!tran_id) {
      return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
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

    console.log("[ABA_PAYWAY_CHECK] Sending Request to:", CHECK_TRANSACTION_URL);
    console.log("[ABA_PAYWAY_CHECK] Payload:", postData);

    try {
      const paywayResponse = await axios.post(CHECK_TRANSACTION_URL, postData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("[ABA_PAYWAY_CHECK] Raw API Response:", JSON.stringify(paywayResponse.data, null, 2));
      
      return NextResponse.json(paywayResponse.data);
    } catch (paywayError: any) {
      console.error("[ABA_PAYWAY_CHECK] API Error:", paywayError.response?.data || paywayError.message);
      return NextResponse.json(
        { error: "Failed to communicate with PayWay API", details: paywayError.response?.data || paywayError.message },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("[ABA_PAYWAY_CHECK] Internal Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
