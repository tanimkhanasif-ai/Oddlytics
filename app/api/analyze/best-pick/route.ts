import { NextRequest, NextResponse } from "next/server";
import { requireSubscriber } from "@/lib/session";
import { fetchTrendingMarkets } from "@/lib/markets/topMarkets";
import { analyzeLiveMarket } from "@/lib/analyzeMarket";
import { checkAnalysisRateLimit, ANALYSIS_LIMIT } from "@/lib/rateLimit";
import type { AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";

/**
 * "Find me the perfect bet": pulls the top live markets by volume and runs each through
 * the same analyze pipeline as a single-market request, returning the highest-confidence pick.
 */
export async function POST(req: NextRequest) {
  const access = await requireSubscriber();
  if (!access.ok) return access.response;

  // This burns several real API calls (one per candidate market) for a single
  // recorded result, so it's gated by the same 12h limit up front, not after.
  const rateLimit = await checkAnalysisRateLimit(access.userId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `You've reached your limit of ${ANALYSIS_LIMIT} analyses for this 12-hour period.`,
        limitExceeded: true,
        resetAt: rateLimit.resetAt,
      },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const capitalUsd = typeof body?.capitalUsd === "number" ? body.capitalUsd : undefined;

  const markets = await fetchTrendingMarkets(5);
  if (markets.length === 0) {
    return NextResponse.json(
      { error: "No live markets available right now — try again shortly." },
      { status: 502 }
    );
  }

  const results = await Promise.allSettled(
    markets.map((m) => {
      const top = m.outcomes[0];
      const yesPrice = (top?.pricePct ?? 50) / 100;
      return analyzeLiveMarket({
        platform: m.platform,
        question: m.question,
        yesPrice,
        noPrice: 1 - yesPrice,
        marketId: m.id,
        capitalUsd,
      });
    })
  );

  const analyses = results
    .filter((r): r is PromiseFulfilledResult<AnalysisResult> => r.status === "fulfilled")
    .map((r) => r.value);

  if (analyses.length === 0) {
    return NextResponse.json({ error: "Couldn't analyze any live markets right now." }, { status: 502 });
  }

  const best = analyses.reduce((a, b) => (b.confidence_pct > a.confidence_pct ? b : a));
  return NextResponse.json(best);
}
