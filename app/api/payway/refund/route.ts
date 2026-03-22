// File: app/api/payway/refund/route.ts

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";

const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY!;
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID!;
const URL = "https://checkout-sandbox.payway.com.kh/api/merchant-portal/merchant-access/online-transaction/refund";

// NOTE: Refund API requires an RSA Public Key from ABA to encrypt 'merchant_auth'.
// Add yours to .env: ABA_PAYWAY_RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----..."
const ABA_PAYWAY_RSA_PUBLIC_KEY = process.env.ABA_PAYWAY_RSA_PUBLIC_KEY;

function getHash(data: string): string {
  const hmac = crypto.createHmac("sha512", ABA_PAYWAY_API_KEY);
  hmac.update(data);
  return hmac.digest("base64");
}

function encryptRSA(data: string, publicKey: string): string {
  const buffer = Buffer.from(data);
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    buffer
  );
  return encrypted.toString("base64");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tran_id, refund_amount } = body;

    if (!tran_id || !refund_amount) {
      return NextResponse.json({ error: "Missing tran_id or refund_amount" }, { status: 400 });
    }

    if (!ABA_PAYWAY_RSA_PUBLIC_KEY) {
      return NextResponse.json({ 
        error: "RSA Public Key missing", 
        details: "Please add ABA_PAYWAY_RSA_PUBLIC_KEY to your .env file to enable refunds." 
      }, { status: 400 });
    }

    const request_time = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    
    // 1. Prepare merchant_auth JSON
    const authData = JSON.stringify({
      mc_id: ABA_PAYWAY_MERCHANT_ID,
      tran_id: tran_id,
      refund_amount: refund_amount
    });

    // 2. RSA Encrypt merchant_auth
    const merchant_auth = encryptRSA(authData, ABA_PAYWAY_RSA_PUBLIC_KEY);

    // 3. Generate SHA512 hash: request_time + merchant_id + merchant_auth
    const hashString = request_time + ABA_PAYWAY_MERCHANT_ID + merchant_auth;
    const hash = getHash(hashString);

    const postData = {
      request_time,
      merchant_id: ABA_PAYWAY_MERCHANT_ID,
      merchant_auth,
      hash
    };

    const response = await axios.post(URL, postData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("PayWay Refund Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to process refund", details: error.message }, { status: 502 });
  }
}
