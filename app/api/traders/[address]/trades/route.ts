import { NextRequest, NextResponse } from "next/server";
import { fetchTraderTrades } from "@/lib/markets/polymarketTraders";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { address: string } }) {
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 20, 50);

  try {
    const trades = await fetchTraderTrades(params.address, limit);
    return NextResponse.json({ trades });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch trade history.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
