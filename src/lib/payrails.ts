import crypto from "crypto";

const PAYRAILS_BASE_URL = process.env.PAYRAILS_BASE_URL ?? "https://payments.petrichorlabs.ca";

export async function createCheckout(
  vendorTxId: string,
  amountCents: number,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  const res = await fetch(`${PAYRAILS_BASE_URL}/api/checkout/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.PAYRAILS_API_KEY!,
    },
    body: JSON.stringify({
      amount_cents: amountCents,
      vendor_tx_id: vendorTxId,
      currency: process.env.PAYRAILS_CURRENCY ?? "cad",
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "PayRails error" }));
    throw new Error(err.error ?? `PayRails ${res.status}`);
  }

  const { checkout_url } = await res.json();
  return checkout_url;
}

export function verifyWebhookSignature(rawBody: string, sigHeader: string): boolean {
  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => p.split("=") as [string, string]),
  );
  const timestamp = parts["t"];
  const v1 = parts["v1"];
  if (!timestamp || !v1) return false;

  // Reject events older than 5 minutes
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > 300) return false;

  const expected = crypto
    .createHmac("sha256", process.env.PAYRAILS_WEBHOOK_SECRET!)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"));
  } catch {
    return false;
  }
}

export type PayRailsEvent =
  | "payment.completed"
  | "payment.refunded"
  | "payment.disputed"
  | "dispute.won"
  | "dispute.lost";

export interface PayRailsWebhookPayload {
  event_id: string;
  event: PayRailsEvent;
  entitlement_token: string;
  vendor_tx_id: string;
  amount_cents: number;
  net_amount_cents: number;
  currency: string;
  paid_at: string;
}
