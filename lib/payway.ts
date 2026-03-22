import crypto from "crypto";
import axios from "axios";

const ABA_PAYWAY_API_KEY = process.env.ABA_PAYWAY_API_KEY!;
const ABA_PAYWAY_MERCHANT_ID = process.env.ABA_PAYWAY_MERCHANT_ID!;
const ABA_PAYWAY_BASE_URL =
  process.env.ABA_PAYWAY_BASE_URL ||
  process.env.ABA_PAWWAY_API_URL?.replace(/\/purchase$/, "") ||
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments";
const ABA_PAYWAY_REFUND_URL =
  process.env.ABA_PAYWAY_REFUND_URL ||
  "https://checkout-sandbox.payway.com.kh/api/merchant-portal/merchant-access/online-transaction/refund";
const ABA_PAYWAY_EXCHANGE_RATE_URL =
  process.env.ABA_PAYWAY_EXCHANGE_RATE_URL ||
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/exchange-rate";

export function getPaywayMerchantId() {
  return ABA_PAYWAY_MERCHANT_ID;
}

export function getPaywayBaseUrl() {
  return ABA_PAYWAY_BASE_URL;
}

export function getPaywayRefundUrl() {
  return ABA_PAYWAY_REFUND_URL;
}

export function getPaywayExchangeRateUrl() {
  return ABA_PAYWAY_EXCHANGE_RATE_URL;
}

export function getPaywayRequestTime() {
  const now = new Date();

  return (
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0")
  );
}

export function getPaywayHash(parts: Array<string | number | boolean | null | undefined>) {
  const hmac = crypto.createHmac("sha512", ABA_PAYWAY_API_KEY);
  hmac.update(parts.map((part) => (part == null ? "" : String(part))).join(""));
  return hmac.digest("base64");
}

export async function postPaywayJson<TBody extends Record<string, unknown>>(url: string, body: TBody) {
  const response = await axios.post(url, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
}

export async function postPaywayMultipart<TBody extends Record<string, unknown>>(url: string, body: TBody) {
  const response = await axios.post(url, body, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
