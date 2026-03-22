// File: app/api/payway/exchange-rate/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";

const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY!;
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID!;
const URL = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/exchange-rate";

function getHash(data: string): string {
  const hmac = crypto.createHmac("sha512", ABA_PAYWAY_API_KEY);
  hmac.update(data);
  return hmac.digest("base64");
}

export async function POST(req: NextRequest) {
  try {
    const now = new Date();
    const req_time = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');

    const hashString = req_time + ABA_PAYWAY_MERCHANT_ID;
    const hash = getHash(hashString);

    const postData = {
      req_time,
      merchant_id: ABA_PAYWAY_MERCHANT_ID,
      hash
    };

    const response = await axios.post(URL, postData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("PayWay Exchange Rate Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to fetch exchange rate" }, { status: 502 });
  }
}
