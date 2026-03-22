// File: app/api/payway/close-transaction/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";

const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY!;
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID!;
const BASE_URL = "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments";
const URL = `${BASE_URL}/close-transaction`;

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

    const now = new Date();
    const req_time = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');

    const hashString = req_time + ABA_PAYWAY_MERCHANT_ID + tran_id;
    const hash = getHash(hashString);

    const postData = {
      req_time,
      merchant_id: ABA_PAYWAY_MERCHANT_ID,
      tran_id,
      hash
    };

    const response = await axios.post(URL, postData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("PayWay Close Transaction Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to close transaction" }, { status: 502 });
  }
}
