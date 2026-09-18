export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date
  body: string[]; // paragraphs
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "what-is-a-prediction-market",
    title: "What Is a Prediction Market? A Beginner's Guide",
    description:
      "A plain-language explainer on how prediction markets like Polymarket and Kalshi work, and what the price of a market actually means.",
    date: "2026-09-01",
    body: [
      "A prediction market is a place where people trade on the outcome of a real-world event — an election, a Fed rate decision, whether a bill passes, even the weather. Instead of betting against a bookmaker, traders buy and sell shares in an outcome, and the price of that share reflects what the market collectively thinks the odds are.",
      "If a market for \"Will X happen?\" is trading YES at 65¢, that roughly means the market believes there's a 65% chance it happens. Buy YES at 65¢ and it resolves true, you get $1 per share — a 35¢ profit. If it resolves false, the share is worth nothing.",
      "The two platforms Oddlytics tracks, Polymarket and Kalshi, differ mainly in structure: Polymarket runs on crypto and lists a huge range of cultural and political questions; Kalshi is a U.S.-regulated exchange with a narrower, more official set of markets. Both work the same way underneath — price reflects collective probability.",
      "Why prices move: new information. A poll drops, a company issues guidance, an official makes a statement — traders update their view, and the price shifts to reflect it. That's the core idea behind Oddlytics' AI Predictor: comparing the current price against an independent estimate of the true probability, and flagging when the gap looks wide enough to be worth a second look.",
      "This is informational analysis, not financial advice. Prediction markets carry real risk, and no price or AI estimate is a guarantee of anything.",
    ],
  },
  {
    slug: "how-oddlytics-scores-confidence",
    title: "How Oddlytics Scores Confidence on Every Pick",
    description:
      "What goes into the confidence percentage on an Oddlytics analysis, and why a wide gap between market price and AI estimate matters more than the number itself.",
    date: "2026-09-08",
    body: [
      "Every analysis on Oddlytics returns a confidence percentage between 1 and 99 — never a flat 0 or 100, because certainty like that doesn't exist in prediction markets. The number reflects how strongly the analysis favors one side once it has weighed base rates, historical precedent for similar events, and what the current price already implies about market consensus.",
      "The number alone isn't the point, though. What actually matters is the gap between that confidence and the market's own implied probability. A pick sitting at 95% confidence on a market already priced at 94¢ isn't an opportunity — the market already agrees. A pick at 70% confidence on a market priced at 40¢ is a much bigger gap, even though the raw confidence number is lower. Oddlytics calls this gap \"edge,\" and it's what Handpicked Bets actually ranks by, not raw confidence.",
      "Position sizing follows the same logic in reverse: the app never suggests more than 5% of stated capital on a single position, and caps it lower — 2%, sometimes less — when confidence sits under 60%. Low confidence isn't hidden or rounded up; it's stated plainly, with the sizing suggestion shrinking to match.",
      "None of this is a promise. It's a structured way of saying \"here's how sure this analysis is, and here's exactly why,\" so you can weigh it yourself rather than take a number on faith.",
    ],
  },
  {
    slug: "kalshi-vs-polymarket",
    title: "Kalshi vs. Polymarket: What's the Difference?",
    description:
      "A quick comparison of the two prediction-market platforms Oddlytics analyzes — what they list, how they're regulated, and how to think about each.",
    date: "2026-09-14",
    body: [
      "Kalshi and Polymarket are the two platforms Oddlytics scans, and while they look similar on the surface — a question, a YES price, a NO price — they're built differently.",
      "Kalshi is a CFTC-regulated U.S. exchange. Markets settle in real dollars, the question set leans toward economic data, Fed decisions, and official political outcomes, and everything is subject to U.S. financial oversight. It reads more like a traditional exchange with a narrower, more curated list of events.",
      "Polymarket runs on crypto rails and lists a far broader range of markets — sports, entertainment, viral news events, and politics well beyond what Kalshi covers. That breadth is also why liquidity and volume vary a lot more from market to market; a niche Polymarket question can have a thin order book in a way a major Kalshi market usually won't.",
      "For Oddlytics' purposes, the platform difference mostly changes what kind of question you're looking at, not how the analysis works — the same edge-over-market-price logic applies either way. The practical difference worth knowing before you trade: Kalshi's regulation and settlement process, versus Polymarket's broader catalog and crypto-native mechanics.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
