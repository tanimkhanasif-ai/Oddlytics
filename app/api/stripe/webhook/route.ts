import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

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

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as {
        client_reference_id?: string | null;
        customer?: string | null;
      };
      const userId = session.client_reference_id;
      const customerId = session.customer;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscribed: true,
            ...(typeof customerId === "string" ? { stripeCustomerId: customerId } : {}),
          },
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as { customer?: string | null };
      const customerId = subscription.customer;
      if (typeof customerId === "string") {
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscribed: false },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
