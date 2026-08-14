import { generateMockAnalysis } from "@/lib/mocks/analysis";
import type { HandpickedBet, Platform } from "@/lib/types";

interface SeedMarket {
  question: string;
  platform: Platform;
  yesPrice: number;
  category: string;
}

const SEED_MARKETS: SeedMarket[] = [
  {
    question: "Will the Federal Reserve cut interest rates at its next scheduled meeting?",
    platform: "polymarket",
    yesPrice: 0.62,
    category: "Macro",
  },
  {
    question: "Will the incumbent party win the next special election in this district?",
    platform: "kalshi",
    yesPrice: 0.41,
    category: "Politics",
  },
  {
    question: "Will the top-seeded team advance past the semifinal round?",
    platform: "polymarket",
    yesPrice: 0.71,
    category: "Sports",
  },
  {
    question: "Will the announced product ship before the end of the quarter?",
    platform: "kalshi",
    yesPrice: 0.29,
    category: "Tech",
  },
  {
    question: "Will the proposed merger receive regulatory approval this year?",
    platform: "polymarket",
    yesPrice: 0.53,
    category: "Business",
  },
];

/** Static curated picks for the paywalled Handpicked Bets page — regenerated fresh each call. */
export function getHandpickedBets(): HandpickedBet[] {
  return SEED_MARKETS.map((m, i) => {
    const mock = generateMockAnalysis({
      question: m.question,
      platform: m.platform,
      yesPrice: m.yesPrice,
      noPrice: 1 - m.yesPrice,
    });
    return {
      id: `hp-${i}`,
      category: m.category,
      postedAt: new Date(Date.now() - i * 86_400_000).toISOString(),
      analysis: { ...mock.result, _yesPrice: mock.yesPrice, _noPrice: mock.noPrice },
    };
  });
}
