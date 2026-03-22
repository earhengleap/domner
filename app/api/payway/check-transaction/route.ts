import { NextRequest, NextResponse } from "next/server";
import {
  getPaywayBaseUrl,
  getPaywayHash,
  getPaywayMerchantId,
  getPaywayRequestTime,
  postPaywayMultipart,
} from "@/lib/payway";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tran_id = body.tran_id;

    if (!tran_id) {
      return NextResponse.json({ error: "Missing tran_id" }, { status: 400 });
    }

    const req_time = getPaywayRequestTime();
    const merchant_id = getPaywayMerchantId();
    const hash = getPaywayHash([req_time, merchant_id, tran_id]);

    const data = await postPaywayMultipart(`${getPaywayBaseUrl()}/check-transaction-2`, {
      req_time,
      merchant_id,
      tran_id,
      hash,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("PayWay Check Transaction Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to check transaction", details: error.response?.data || error.message },
      { status: 502 }
    );
  }
}
