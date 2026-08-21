import { NextRequest, NextResponse } from "next/server";
import { EventName } from "@paddle/paddle-node-sdk";
import { getPaddleClient } from "@/lib/paddle";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Real Paddle webhook — set PADDLE_API_KEY and PADDLE_WEBHOOK_SECRET to enable this.
// Point your Paddle notification destination at POST /api/paddle/webhook once deployed.
export async function POST(req: NextRequest) {
  if (!process.env.PADDLE_API_KEY || !process.env.PADDLE_WEBHOOK_SECRET) {
    return NextResponse.json(
      {
        error:
          "Paddle webhook isn't configured yet. Set PADDLE_API_KEY and PADDLE_WEBHOOK_SECRET to enable it.",
      },
      { status: 501 }
    );
  }

  const signature = req.headers.get("paddle-signature");
  const rawBody = await req.text();

  try {
    const paddle = getPaddleClient();
    const event = await paddle.webhooks.unmarshal(
      rawBody,
      process.env.PADDLE_WEBHOOK_SECRET,
      signature || ""
    );

    if (event.eventType === EventName.SubscriptionActivated) {
      const userId =
        typeof event.data.customData?.userId === "string" ? event.data.customData.userId : null;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { subscribed: true, paddleCustomerId: event.data.customerId },
        });
      }
    }

    if (
      event.eventType === EventName.SubscriptionCanceled ||
      event.eventType === EventName.SubscriptionPastDue
    ) {
      await prisma.user.updateMany({
        where: { paddleCustomerId: event.data.customerId },
        data: { subscribed: false },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
