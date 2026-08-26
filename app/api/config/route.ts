import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Without this, Next.js can statically cache this response at build time
// (no dynamic APIs are used here otherwise) — meaning an env var flipped on
// later wouldn't show up until a full rebuild. Always read process.env fresh.
export const dynamic = "force-dynamic";

/** Lets client components know whether real AI/payment keys are configured, without exposing them. */
export async function GET() {
  return NextResponse.json({
    aiEnabled: !!process.env.ANTHROPIC_API_KEY,
    paddleEnabled: !!(process.env.PADDLE_API_KEY && process.env.PADDLE_WEBHOOK_SECRET),
    googleEnabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
}
