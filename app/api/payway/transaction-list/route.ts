import { NextRequest, NextResponse } from "next/server";
import {
  getPaywayBaseUrl,
  getPaywayHash,
  getPaywayMerchantId,
  getPaywayRequestTime,
  postPaywayJson,
} from "@/lib/payway";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const req_time = getPaywayRequestTime();
    const merchant_id = getPaywayMerchantId();
    const from_date = body.from_date ?? null;
    const to_date = body.to_date ?? null;
    const from_amount = body.from_amount ?? null;
    const to_amount = body.to_amount ?? null;
    const status = body.status ?? null;
    const page = body.page ?? "1";
    const pagination = body.pagination ?? "20";

    const hash = getPaywayHash([
      req_time,
      merchant_id,
      from_date,
      to_date,
      from_amount,
      to_amount,
      status,
      page,
      pagination,
    ]);

    const data = await postPaywayJson(`${getPaywayBaseUrl()}/transaction-list-2`, {
      req_time,
      merchant_id,
      from_date,
      to_date,
      from_amount,
      to_amount,
      status,
      page,
      pagination,
      hash,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("PayWay Transaction List Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to fetch transaction list", details: error.response?.data || error.message },
      { status: 502 }
    );
  }
}
