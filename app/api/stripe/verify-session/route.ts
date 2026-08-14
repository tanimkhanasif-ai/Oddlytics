import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
  }

  // TODO: real Stripe session verification — runs once STRIPE_SECRET_KEY is
  // set and the session wasn't one of our own mock IDs.
  if (process.env.STRIPE_SECRET_KEY && !sessionId.startsWith("mock_")) {
    try {
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return NextResponse.json({ paid: session.payment_status === "paid" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to verify Stripe session.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Mock session: always treat as paid so the test-mode flow is fully clickable.
  return NextResponse.json({ paid: true });
}
