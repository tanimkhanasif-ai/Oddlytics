import { NextRequest, NextResponse } from "next/server";
import { fetchTrendingMarkets } from "@/lib/markets/topMarkets";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.min(24, Math.max(1, parseInt(limitParam, 10) || 9)) : 9;

  try {
    const markets = await fetchTrendingMarkets(limit);
    return NextResponse.json({ markets });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch trending markets.";
    return NextResponse.json({ error: message, markets: [] }, { status: 502 });
  }
}
