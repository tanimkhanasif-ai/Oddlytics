import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Lets client components know whether real AI/payment keys are configured, without exposing them. */
export async function GET() {
  return NextResponse.json({
    aiEnabled: !!process.env.ANTHROPIC_API_KEY,
    paddleEnabled: !!(process.env.PADDLE_API_KEY && process.env.PADDLE_WEBHOOK_SECRET),
    googleEnabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
}
