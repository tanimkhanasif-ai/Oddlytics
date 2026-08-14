import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

// TODO: real Stripe webhook — set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
// (from `stripe listen` locally, or the endpoint's signing secret in
// production) to enable this. Point your Stripe webhook endpoint at
// POST /api/stripe/webhook once deployed.
export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        error:
          "Stripe webhook isn't configured yet. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to enable it.",
      },
      { status: 501 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  try {
    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature || "",
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (
      event.type === "checkout.session.completed" ||
      event.type === "customer.subscription.deleted"
    ) {
      // TODO: persist subscription state server-side once there's a real
      // user/DB layer. Oddlytics currently has no auth or database — the
      // "subscribed" flag lives in the browser's localStorage (see
      // lib/hooks/useSubscription.ts), which this webhook can't reach.
      // Before relying on this in production, add a users/subscriptions
      // table keyed by Stripe customer ID and update it here.
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
