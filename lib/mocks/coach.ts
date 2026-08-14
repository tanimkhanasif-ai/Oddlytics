import type { AnalysisResult, ChatMessage } from "@/lib/types";
import { truncate } from "@/lib/utils";

const CANNED: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["confidence"],
    reply:
      "The confidence score is the model's own sense of how one-sided the evidence looks, not a guarantee — a 60% confidence pick can still lose. Think of it as 'how lopsided,' not 'how sure to win.'",
  },
  {
    keywords: ["maker", "taker", "fee"],
    reply:
      "A maker order adds new liquidity to the order book (you're waiting to be matched), while a taker order fills an existing order right away. Makers usually pay lower fees since they help keep the market liquid.",
  },
  {
    keywords: ["copy trad"],
    reply:
      "Copy trading means automatically mirroring another trader's positions in your own account. It doesn't guarantee their results transfer to you — timing, fees, and position sizing differences all change the outcome.",
  },
  {
    keywords: ["paper trad", "virtual money", "fake money"],
    reply:
      "Paper trading uses virtual play money, not real funds — it's a sandbox for testing how a strategy would have performed without any real financial risk.",
  },
  {
    keywords: ["stop loss"],
    reply:
      "A stop loss is a price level where you'd exit a losing position to cap further downside, rather than riding it all the way down.",
  },
  {
    keywords: ["take profit"],
    reply:
      "A take profit is a price level where you'd consider locking in gains rather than holding out for more upside — and risking giving it back.",
  },
  {
    keywords: ["handpicked", "paywall", "subscription", "premium"],
    reply:
      "Handpicked Bets is a curated feed of picks behind a subscription. Right now checkout runs in test mode, so nothing is actually charged until real payment keys are connected.",
  },
];

export function generateMockCoachReply(
  messages: ChatMessage[],
  context: AnalysisResult | null
): string {
  const last = messages[messages.length - 1]?.content.toLowerCase() ?? "";
  const match = CANNED.find((c) => c.keywords.some((k) => last.includes(k)));

  if (match) return match.reply;

  const contextNote = context
    ? ` I can see you're currently looking at "${truncate(
        context.market_question,
        50
      )}" — once real analysis is connected I'll be able to reference it directly.`
    : "";

  return `That's a good question — I'm currently running on a demo/mocked reply since the real AI Coach isn't connected yet.${contextNote} Set ANTHROPIC_API_KEY to get real, context-aware answers here.`;
}
