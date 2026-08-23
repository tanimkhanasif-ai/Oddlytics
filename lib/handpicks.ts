import { prisma } from "@/lib/prisma";
import { fetchTrendingMarkets, type TrendingMarket } from "@/lib/markets/topMarkets";
import { analyzeLiveMarket } from "@/lib/analyzeMarket";
import type { AnalysisResult } from "@/lib/types";

/** How many live markets to scan each run. */
const SCAN_SIZE = 40;
/** Only markets the AI is at least this sure about are eligible. */
export const MIN_CONFIDENCE = 70;
/** How many picks survive into the published set. */
const PICK_COUNT = 10;
/** Analyze in small batches so one run doesn't hammer the API. */
const BATCH_SIZE = 5;

/** Monday 00:00 UTC of the week a given date falls in — the key every pick is filed under. */
export function weekStart(d = new Date()): Date {
  const out = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = out.getUTCDay(); // 0 = Sunday
  const backToMonday = dow === 0 ? 6 : dow - 1;
  out.setUTCDate(out.getUTCDate() - backToMonday);
  return out;
}

/** Start of the next weekly refresh, for the countdown on the page. */
export function nextWeekStart(d = new Date()): Date {
  const next = weekStart(d);
  next.setUTCDate(next.getUTCDate() + 7);
  return next;
}

interface Scored {
  market: TrendingMarket;
  analysis: AnalysisResult;
  side: "YES" | "NO";
  confidence: number;
  marketPct: number;
  edge: number;
}

/**
 * Market-implied probability for the side the AI picked. A market trading at
 * 80¢ for YES is already saying "80% likely", so this is what the AI's own
 * confidence has to be measured against.
 */
function impliedPctFor(side: "YES" | "NO", yesPct: number): number {
  return side === "YES" ? yesPct : 100 - yesPct;
}

async function scoreMarket(market: TrendingMarket): Promise<Scored | null> {
  const yesPct = market.outcomes[0]?.pricePct ?? 50;
  const yesPrice = yesPct / 100;

  try {
    const analysis = await analyzeLiveMarket({
      platform: market.platform,
      question: market.question,
      yesPrice,
      noPrice: 1 - yesPrice,
    });

    const side = analysis.recommendation;
    const confidence = analysis.confidence_pct;
    const marketPct = impliedPctFor(side, yesPct);

    return { market, analysis, side, confidence, marketPct, edge: confidence - marketPct };
  } catch {
    // A single market failing to analyze shouldn't sink the whole run.
    return null;
  }
}

/**
 * Scan live markets, keep the ones the AI is confident about, and publish the
 * strongest as this week's picks. Ranked by edge (how far the AI's confidence
 * sits above the market's own implied probability) rather than raw confidence —
 * a 95%-confident pick on a market already priced at 95¢ is not an opportunity.
 */
export async function curateWeeklyPicks(): Promise<{ weekOf: Date; count: number; scanned: number }> {
  const week = weekStart();
  const markets = await fetchTrendingMarkets(SCAN_SIZE);

  const scored: Scored[] = [];
  for (let i = 0; i < markets.length; i += BATCH_SIZE) {
    const batch = markets.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(scoreMarket));
    for (const r of results) if (r) scored.push(r);
  }

  const winners = scored
    .filter((s) => s.confidence >= MIN_CONFIDENCE)
    .sort((a, b) => b.edge - a.edge || b.confidence - a.confidence)
    .slice(0, PICK_COUNT);

  await prisma.$transaction([
    prisma.handpickedPick.deleteMany({ where: { weekOf: week } }),
    prisma.handpickedPick.createMany({
      data: winners.map((w, i) => ({
        weekOf: week,
        rank: i + 1,
        platform: w.market.platform,
        marketId: w.market.id,
        question: w.market.question,
        url: w.market.url ?? null,
        side: w.side,
        confidence: w.confidence,
        marketPct: w.marketPct,
        edge: w.edge,
        volumeUsd: w.market.volumeUsd,
        analysis: w.analysis as unknown as object,
      })),
    }),
  ]);

  return { weekOf: week, count: winners.length, scanned: markets.length };
}

/** This week's published picks, in rank order. */
export async function getCurrentPicks() {
  return prisma.handpickedPick.findMany({
    where: { weekOf: weekStart() },
    orderBy: { rank: "asc" },
  });
}
