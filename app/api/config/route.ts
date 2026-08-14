import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Lets client components know whether real AI/payment keys are configured, without exposing them. */
export async function GET() {
  return NextResponse.json({
    aiEnabled: !!process.env.ANTHROPIC_API_KEY,
    stripeEnabled: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID),
  });
}
