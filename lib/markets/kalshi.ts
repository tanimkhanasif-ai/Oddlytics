import type { MarketQuote } from "@/lib/types";

const KALSHI_BASE = "https://api.elections.kalshi.com/trade-api/v2";

interface KalshiMarket {
  ticker: string;
  title: string;
  subtitle?: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
}

function extractKalshiTicker(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    if (!url.hostname.includes("kalshi.com")) return trimmed.toUpperCase();
    const parts = url.pathname.split("/").filter(Boolean);
    return (parts[parts.length - 1] || trimmed).toUpperCase();
  } catch {
    return trimmed.toUpperCase();
  }
}

export async function fetchKalshiQuote(input: string): Promise<MarketQuote> {
  const ticker = extractKalshiTicker(input);
  if (!ticker) {
    throw new Error("Couldn't parse a Kalshi ticker or market URL from that input.");
  }

  const res = await fetch(
    `${KALSHI_BASE}/markets/${encodeURIComponent(ticker)}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(
      `Kalshi lookup failed (HTTP ${res.status}). Check the ticker/URL and try again.`
    );
  }
  const data = await res.json();
  const market: KalshiMarket | undefined = data.market;
  if (!market) {
    throw new Error("No market data returned by Kalshi for that ticker.");
  }

  const yesMid =
    market.yes_bid != null && market.yes_ask != null
      ? (market.yes_bid + market.yes_ask) / 2
      : market.last_price;
  const yesPrice = yesMid / 100;
  const noPrice = 1 - yesPrice;
  const question = market.subtitle
    ? `${market.title} — ${market.subtitle}`
    : market.title;

  return {
    question,
    platform: "kalshi",
    yesPrice,
    noPrice,
    url: input,
    id: ticker,
  };
}
