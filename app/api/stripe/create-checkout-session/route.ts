import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Log in first." }, { status: 401 });
  }

  const origin = req.nextUrl.origin;

  // ---------------------------------------------------------------------
  // TODO: real Stripe Checkout Session — this block only runs once
  // STRIPE_SECRET_KEY and STRIPE_PRICE_ID are set in .env.local. Nothing
  // else needs to change for the Handpicked Bets paywall to switch from
  // the mocked test-mode checkout to a real Stripe Checkout session.
  // client_reference_id ties the session back to our own user id so the
  // webhook (app/api/stripe/webhook/route.ts) knows whose subscription to
  // update.
  // ---------------------------------------------------------------------
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID) {
    try {
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        client_reference_id: userId,
        line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
        success_url: `${origin}/handpicked-bets?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/handpicked-bets?checkout=cancelled`,
      });
      return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Stripe checkout session failed.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Mocked checkout: no Stripe keys configured yet, so simulate the flow
  // entirely inside the app (see app/checkout/mock/page.tsx). Test mode —
  // no real payment is ever processed here.
  const mockSessionId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return NextResponse.json({ url: `/checkout/mock?session_id=${mockSessionId}` });
}
