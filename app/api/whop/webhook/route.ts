import { NextRequest, NextResponse } from "next/server";
import { unwrapWebhook } from "@whop/sdk/helpers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface WhopWebhookEvent {
  action?: string;
  type?: string;
  data?: {
    id?: string;
    metadata?: Record<string, unknown> | null;
  };
}

// Real Whop webhook — set WHOP_WEBHOOK_SECRET to enable this.
// Point your Whop webhook endpoint at POST /api/whop/webhook once deployed.
export async function POST(req: NextRequest) {
  const key = process.env.WHOP_WEBHOOK_SECRET;
  if (!key) {
    return NextResponse.json(
      { error: "Whop webhook isn't configured yet. Set WHOP_WEBHOOK_SECRET to enable it." },
      { status: 501 }
    );
  }

  const rawBody = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value, name) => {
    headers[name] = value;
  });

  let event: WhopWebhookEvent;
  try {
    event = unwrapWebhook<WhopWebhookEvent>(rawBody, { headers, key });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const eventName = event.action ?? event.type ?? "";
  const data = event.data ?? {};
  const userId = typeof data.metadata?.userId === "string" ? data.metadata.userId : null;
  const membershipId = typeof data.id === "string" ? data.id : null;

  if (eventName === "membership.activated" && userId) {
    await prisma.user.updateMany({
      where: { id: userId },
      data: { subscribed: true, whopMembershipId: membershipId },
    });
  }

  if (eventName === "membership.deactivated") {
    if (userId) {
      await prisma.user.updateMany({ where: { id: userId }, data: { subscribed: false } });
    } else if (membershipId) {
      await prisma.user.updateMany({
        where: { whopMembershipId: membershipId },
        data: { subscribed: false },
      });
    }
  }

  return NextResponse.json({ received: true });
}
