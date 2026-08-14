import { NextResponse } from "next/server";
import { fetchRecentNotableTrades } from "@/lib/markets/polymarketTraders";

export const runtime = "nodejs";

/** Powers the social-proof toast — real, recent, sizeable Polymarket trades. Not user testimonials. */
export async function GET() {
  try {
    const trades = await fetchRecentNotableTrades(8);
    return NextResponse.json({ trades });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch recent activity.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
