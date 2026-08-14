import { NextRequest, NextResponse } from "next/server";
import { fetchPolymarketQuote } from "@/lib/markets/polymarket";
import { fetchKalshiQuote } from "@/lib/markets/kalshi";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const platform = body?.platform;
  const input = body?.input;

  if (!input || typeof input !== "string") {
    return NextResponse.json(
      { error: "Missing a market URL, slug, or ticker." },
      { status: 400 }
    );
  }
  if (platform !== "polymarket" && platform !== "kalshi") {
    return NextResponse.json(
      { error: "platform must be 'polymarket' or 'kalshi'." },
      { status: 400 }
    );
  }

  try {
    const quote =
      platform === "kalshi"
        ? await fetchKalshiQuote(input)
        : await fetchPolymarketQuote(input);
    return NextResponse.json(quote);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch market data.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
