/**
 * Billing provider placeholder.
 *
 * When you integrate Stripe (or another provider), this is where you:
 * - create checkout sessions
 * - fetch customer/subscription status
 * - verify webhook signatures
 * - map provider products/prices to PlanName
 */

export type BillingProvider = "stripe" | "flutterwave" | "pesapal" | "paypal" | "paystack" | "simulated";

export type WebhookEvent = {
  provider: BillingProvider;
  type: string;
  payload: unknown;
};

export function verifyWebhookSignature(_rawBody: string, _signature: string | null) {
  // TODO: implement per provider
  return { ok: false as const, message: "Webhook verification not implemented" };
}

