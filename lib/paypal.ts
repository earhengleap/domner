// lib/paypal.ts

import fetch from "node-fetch";

const PAYPAL_API_URL =
  process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

interface PayPalAuthResponse {
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  // Add other properties as needed
}

function isPayPalAuthResponse(obj: unknown): obj is PayPalAuthResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "access_token" in obj &&
    typeof (obj as PayPalAuthResponse).access_token === "string"
  );
}

function isPayPalOrderResponse(obj: unknown): obj is PayPalOrderResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    typeof (obj as PayPalOrderResponse).id === "string" &&
    "status" in obj &&
    typeof (obj as PayPalOrderResponse).status === "string"
  );
}

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const data: unknown = await response.json();

  if (!isPayPalAuthResponse(data)) {
    throw new Error("Invalid response from PayPal authentication");
  }

  return data.access_token;
}

export async function createPayPalOrder(
  bookingId: string,
  amount: number
): Promise<PayPalOrderResponse> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: bookingId,
          amount: {
            currency_code: "USD",
            value: amount.toFixed(2),
          },
        },
      ],
    }),
  });

  const data: unknown = await response.json();

  if (!isPayPalOrderResponse(data)) {
    throw new Error("Invalid response from PayPal order creation");
  }

  return data;
}

export async function capturePayPalPayment(
  orderId: string
): Promise<PayPalOrderResponse> {
  const accessToken = await getAccessToken();
  const response = await fetch(
    `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data: unknown = await response.json();

  if (!isPayPalOrderResponse(data)) {
    throw new Error("Invalid response from PayPal payment capture");
  }

  return data;
}
