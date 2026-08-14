import type { AnalysisResult, Platform } from "@/lib/types";
import { truncate } from "@/lib/utils";

export interface MockAnalysisInput {
  question: string;
  platform: Platform;
  yesPrice?: number;
  noPrice?: number;
  capitalUsd?: number;
}

export interface MockAnalysisOutput {
  result: AnalysisResult;
  yesPrice: number;
  noPrice: number;
}

/** Deterministic PRNG seeded from a string, so the same question always mocks the same way. */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function next() {
    h = Math.imul(h ^ (h >>> 16), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const REASON_TEMPLATES = [
  (q: string) =>
    `The current price on "${truncate(q, 70)}" implies a probability that looks slightly out of step with typical base rates for similar questions.`,
  () => "Recent trading volume suggests the market hasn't fully priced in the latest available information.",
  () => "Historical resolution patterns for comparable markets tend to drift toward the favored side as the deadline approaches.",
  () => "The gap between the implied price and a reasonable fair-value estimate is wide enough to be worth a modest position.",
];

const RISK_TEMPLATES = [
  "This confidence score is randomly generated for demo purposes and does not reflect real research into this market.",
  "A late-breaking news event or official statement could shift the true probability well outside this estimate.",
  "Thin liquidity on some prediction markets can make prices swing sharply on small trades, independent of new information.",
];

export function generateMockAnalysis(input: MockAnalysisInput): MockAnalysisOutput {
  const rand = seededRandom(`${input.question}|${input.platform}|${input.yesPrice ?? "na"}`);

  const yesPrice = input.yesPrice ?? 0.35 + rand() * 0.3;
  const noPrice = input.noPrice ?? 1 - yesPrice;

  const leansYes = yesPrice < 0.5;
  const recommendation: "YES" | "NO" =
    rand() > 0.3 ? (leansYes ? "YES" : "NO") : leansYes ? "NO" : "YES";

  const confidencePct = Math.round(45 + rand() * 40); // 45-85, mock never claims extreme certainty

  const pctCap = confidencePct < 60 ? 2 : confidencePct <= 75 ? 3 + Math.round(rand()) : 5;
  const suggestedAmount =
    typeof input.capitalUsd === "number" && input.capitalUsd > 0
      ? Math.round((input.capitalUsd * pctCap) / 100)
      : null;

  const entryPrice = recommendation === "YES" ? yesPrice : noPrice;
  const entryPct = Math.round(entryPrice * 100);
  const takeProfitPct = Math.min(97, entryPct + 15 + Math.round(rand() * 10));
  const stopLossPct = Math.max(3, entryPct - 12 - Math.round(rand() * 8));

  const question = input.question || "Uploaded market screenshot";

  const result: AnalysisResult = {
    market_question: question,
    platform: input.platform,
    recommendation,
    confidence_pct: confidencePct,
    reasons: [
      "This is a mocked analysis — the real Anthropic API isn't connected yet, so nothing below reflects actual research.",
      REASON_TEMPLATES[1](question),
      REASON_TEMPLATES[Math.floor(rand() * REASON_TEMPLATES.length)](question),
    ],
    key_risks: [RISK_TEMPLATES[0], RISK_TEMPLATES[1 + Math.floor(rand() * 2)]],
    position_sizing: {
      suggested_pct_of_capital: pctCap,
      suggested_amount: suggestedAmount,
      rationale:
        "A placeholder sizing scaled to the mock confidence level — real position sizing rules will apply once live analysis is connected.",
    },
    take_profit: { sell_if_price_reaches: `${takeProfitPct}¢ or higher` },
    stop_loss: { sell_if_price_falls_to: `${stopLossPct}¢ or lower` },
    exit_if: [
      "A major news event or official statement changes the facts on the ground for this market.",
      "The market's resolution criteria or deadline changes.",
    ],
    _mock: true,
  };

  return { result, yesPrice, noPrice };
}
