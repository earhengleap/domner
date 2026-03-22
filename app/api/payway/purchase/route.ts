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

    const req_time = getPaywayRequestTime();
    const merchant_id = getPaywayMerchantId();
    const tran_id = body.tran_id;
    const firstname = body.firstname || "";
    const lastname = body.lastname || "";
    const email = body.email || "";
    const phone = body.phone || "";
    const type = body.type || "purchase";
    const payment_option = body.payment_option || "";
    const items = body.items || "";
    const shipping = body.shipping || "";
    const amount = body.amount;
    const currency = body.currency || "USD";
    const return_url = body.return_url || "";
    const cancel_url = body.cancel_url || "";
    const skip_success_page = body.skip_success_page || "";
    const continue_success_url = body.continue_success_url || "";
    const return_deeplink = body.return_deeplink || "";
    const custom_fields = body.custom_fields || "";
    const return_params = body.return_params || "";
    const view_type = body.view_type || "";
    const payment_gate = body.payment_gate || "";
    const payout = body.payout || "";
    const additional_params = body.additional_params || "";
    const lifetime = body.lifetime || "";
    const google_pay_token = body.google_pay_token || "";

    if (!tran_id || !amount || !items) {
      return NextResponse.json(
        { error: "Missing tran_id, amount, or items" },
        { status: 400 }
      );
    }

    const hash = getPaywayHash([
      req_time,
      merchant_id,
      tran_id,
      firstname,
      lastname,
      email,
      phone,
      type,
      payment_option,
      items,
      shipping,
      amount,
      currency,
      return_url,
      cancel_url,
      skip_success_page,
      continue_success_url,
      return_deeplink,
      custom_fields,
      return_params,
      view_type,
      payment_gate,
      payout,
      additional_params,
      lifetime,
      google_pay_token,
    ]);

    const data = await postPaywayMultipart(`${getPaywayBaseUrl()}/purchase`, {
      req_time,
      merchant_id,
      tran_id,
      firstname,
      lastname,
      email,
      phone,
      type,
      payment_option,
      items,
      shipping,
      amount,
      currency,
      return_url,
      cancel_url,
      skip_success_page,
      continue_success_url,
      return_deeplink,
      custom_fields,
      return_params,
      view_type,
      payment_gate,
      payout,
      additional_params,
      lifetime,
      google_pay_token,
      hash,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("PayWay Purchase Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to create purchase", details: error.response?.data || error.message },
      { status: 502 }
    );
  }
}
