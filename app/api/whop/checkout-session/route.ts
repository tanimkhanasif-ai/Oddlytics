import { NextResponse } from "next/server";
import { getWhopClient } from "@/lib/whop";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

// Creates a Whop checkout configuration for the signed-in user and hands back
// Whop's own purchase_url — a complete, ready-to-use checkout link Whop
// generates itself, the same kind its dashboard's "Checkout Links" feature
// produces. The browser is sent there directly (full-page redirect) rather
// than embedding it, after both embed SDKs 404'd on this account for reasons
// only Whop's side could explain. metadata.userId is read back by the
// webhook to know which Oddlytics user just subscribed.
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

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";
  // Whop requires an https redirect_url with no localhost exception, so on
  // local http dev there's nothing valid to send — omit it and let Whop's
  // own default post-checkout page show instead.
  const redirectUrl = origin.startsWith("https://") ? `${origin}/pricing?checkout=complete` : undefined;

  try {
    const whop = getWhopClient();
    const config = await whop.checkoutConfigurations.create({
      plan_id: planId,
      metadata: { userId },
      redirect_url: redirectUrl,
    });
    if (!config.purchase_url) {
      console.log("[whop] checkout configuration created but no purchase_url:", JSON.stringify(config, null, 2));
      return NextResponse.json({ error: "Whop didn't return a checkout URL." }, { status: 502 });
    }
    return NextResponse.json({ url: config.purchase_url });
  } catch (err: unknown) {
    const body = err && typeof err === "object" && "body" in err ? (err as { body: unknown }).body : undefined;
    console.log("[whop] checkout configuration creation failed. body:", JSON.stringify(body, null, 2));
    const message = err instanceof Error ? err.message : "Failed to create checkout configuration.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
