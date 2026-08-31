import { NextResponse } from "next/server";
import { getWhopClient } from "@/lib/whop";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

// Opens a Whop checkout session for the signed-in user. The plan's price is
// charged to metadata.userId once the session completes — the webhook reads
// it back to know which Oddlytics user just subscribed.
export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const planId = process.env.WHOP_PLAN_ID;
  if (!process.env.WHOP_API_KEY || !planId) {
    return NextResponse.json(
      { error: "Whop checkout isn't configured yet. Set WHOP_API_KEY and WHOP_PLAN_ID to enable it." },
      { status: 501 }
    );
  }

  // Whop records the checkout's browser origin from the request's Origin header,
  // but this call is server-to-server so there is none — pass it explicitly, or
  // the session comes back with no recorded origin and its checkout page 404s.
  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? undefined;

  try {
    const whop = getWhopClient();
    const session = await whop.checkoutSessions.create({
      items: [{ plan: planId }],
      metadata: { userId },
      origin,
    });
    console.log("[whop] checkout session created:", JSON.stringify(session, null, 2));
    return NextResponse.json({ sessionId: session.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
