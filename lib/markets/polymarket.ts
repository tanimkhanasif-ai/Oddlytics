import type { MarketQuote } from "@/lib/types";

const GAMMA_BASE = "https://gamma-api.polymarket.com";

interface GammaMarket {
  question: string;
  outcomes: string;
  outcomePrices: string;
  slug: string;
  closed?: boolean;
}

interface ParsedInput {
  kind: "event" | "market";
  slug: string;
}

function extractPolymarketSlug(input: string): ParsedInput | null {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    if (!url.hostname.includes("polymarket.com")) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    const eventIdx = parts.indexOf("event");
    if (eventIdx !== -1 && parts[eventIdx + 1]) {
      return { kind: "event", slug: parts[eventIdx + 1] };
    }
    const marketIdx = parts.indexOf("market");
    if (marketIdx !== -1 && parts[marketIdx + 1]) {
      return { kind: "market", slug: parts[marketIdx + 1] };
    }
    return null;
  } catch {
    if (!trimmed) return null;
    return { kind: "market", slug: trimmed };
  }
}

function parseGammaMarket(m: GammaMarket, url?: string): MarketQuote | null {
  try {
    const outcomes: string[] = JSON.parse(m.outcomes);
    const prices: string[] = JSON.parse(m.outcomePrices);
    const yesIdx = outcomes.findIndex((o) => o.toLowerCase() === "yes");
    const noIdx = outcomes.findIndex((o) => o.toLowerCase() === "no");
    const yesPrice = parseFloat(prices[yesIdx !== -1 ? yesIdx : 0]);
    if (Number.isNaN(yesPrice)) return null;
    const noPriceRaw = noIdx !== -1 ? parseFloat(prices[noIdx]) : NaN;
    const noPrice = Number.isNaN(noPriceRaw) ? 1 - yesPrice : noPriceRaw;
    return {
      question: m.question,
      platform: "polymarket",
      yesPrice,
      noPrice,
      url,
    };
  } catch {
    return null;
  }
}

export async function fetchPolymarketQuote(input: string): Promise<MarketQuote> {
  const parsed = extractPolymarketSlug(input);
  if (!parsed) {
    throw new Error(
      "Couldn't parse a Polymarket market/event URL or slug from that input."
    );
  }

  if (parsed.kind === "market") {
    const res = await fetch(
      `${GAMMA_BASE}/markets/slug/${encodeURIComponent(parsed.slug)}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      const market: GammaMarket | undefined = Array.isArray(data) ? data[0] : data;
      if (market) {
        const quote = parseGammaMarket(market, input);
        // Store the slug that reached this result, not the raw input — a
        // bare slug round-trips through this same function later, which is
        // what real-time re-pricing (lib/markets/livePrice.ts) relies on.
        if (quote) return { ...quote, id: parsed.slug };
      }
    }
  }

  const eventRes = await fetch(
    `${GAMMA_BASE}/events/slug/${encodeURIComponent(parsed.slug)}`,
    { cache: "no-store" }
  );
  if (!eventRes.ok) {
    throw new Error(
      `Polymarket lookup failed (HTTP ${eventRes.status}). Check the URL and try again.`
    );
  }
  const event = await eventRes.json();
  const markets: GammaMarket[] = event.markets || [];
  if (!markets.length) {
    throw new Error("No markets found for that Polymarket event.");
  }
  const market = markets.find((m) => !m.closed) || markets[0];
  const quote = parseGammaMarket(market, input);
  if (!quote) {
    throw new Error("Couldn't parse prices from the Polymarket market data.");
  }
  return { ...quote, id: parsed.slug };
}
