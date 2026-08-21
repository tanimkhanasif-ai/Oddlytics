export interface TrendingMarketOutcome {
  label: string;
  pricePct: number;
}

export interface TrendingMarket {
  id: string;
  platform: "polymarket" | "kalshi";
  question: string;
  outcomes: TrendingMarketOutcome[];
  moreCount: number;
  volumeUsd: number;
  date: string | null;
  url?: string;
}

const GAMMA_BASE = "https://gamma-api.polymarket.com";
const KALSHI_BASE = "https://api.elections.kalshi.com/trade-api/v2";

interface GammaEventMarket {
  question: string;
  groupItemTitle?: string;
  outcomes: string;
  outcomePrices: string;
  slug: string;
  closed?: boolean;
}

interface GammaEvent {
  id: string;
  title: string;
  slug: string;
  volume?: string | number;
  volume24hr?: string | number;
  endDate?: string;
  markets?: GammaEventMarket[];
}

function parseOutcomes(m: GammaEventMarket): TrendingMarketOutcome[] {
  try {
    const labels: string[] = JSON.parse(m.outcomes);
    const prices: string[] = JSON.parse(m.outcomePrices);
    const yesIdx = labels.findIndex((o) => o.toLowerCase() === "yes");
    const label = m.groupItemTitle || (yesIdx !== -1 ? m.question : labels[0]);
    const priceRaw = yesIdx !== -1 ? prices[yesIdx] : prices[0];
    const pricePct = Math.round(parseFloat(priceRaw) * 100);
    if (Number.isNaN(pricePct)) return [];
    return [{ label, pricePct }];
  } catch {
    return [];
  }
}

/** Real, live top markets from Polymarket's public Gamma API, sorted by 24h volume. */
export async function fetchTrendingPolymarketMarkets(limit: number): Promise<TrendingMarket[]> {
  const res = await fetch(
    `${GAMMA_BASE}/events?active=true&closed=false&order=volume24hr&ascending=false&limit=${limit}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Polymarket events lookup failed (HTTP ${res.status}).`);
  const events: GammaEvent[] = await res.json();

  return events
    .map((e): TrendingMarket | null => {
      const markets = e.markets || [];
      if (!markets.length) return null;
      const outcomes = markets
        .flatMap(parseOutcomes)
        .sort((a, b) => b.pricePct - a.pricePct);
      if (!outcomes.length) return null;
      const volumeUsd = Number(e.volume24hr ?? e.volume ?? 0);
      return {
        id: e.id,
        platform: "polymarket",
        question: e.title,
        outcomes: outcomes.slice(0, 2),
        moreCount: Math.max(0, outcomes.length - 2),
        volumeUsd,
        date: e.endDate ?? null,
        url: `https://polymarket.com/event/${e.slug}`,
      };
    })
    .filter((m): m is TrendingMarket => m !== null);
}

interface KalshiMarket {
  ticker: string;
  title: string;
  subtitle?: string;
  yes_bid: number;
  yes_ask: number;
  last_price: number;
  volume?: number;
  volume_24h?: number;
  close_time?: string;
}

/** Real, live top markets from Kalshi's public Trade API v2, sorted by volume (Kalshi has no server-side volume sort, so this fetches a page and sorts client-side). */
export async function fetchTrendingKalshiMarkets(limit: number): Promise<TrendingMarket[]> {
  const res = await fetch(`${KALSHI_BASE}/markets?status=open&limit=100`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Kalshi markets lookup failed (HTTP ${res.status}).`);
  const data = await res.json();
  const markets: KalshiMarket[] = data.markets || [];

  return markets
    .map((m) => ({ m, volumeUsd: Number(m.volume_24h ?? m.volume ?? 0) }))
    .sort((a, b) => b.volumeUsd - a.volumeUsd)
    .slice(0, limit)
    .map(({ m, volumeUsd }): TrendingMarket => {
      const yesMid = m.yes_bid != null && m.yes_ask != null ? (m.yes_bid + m.yes_ask) / 2 : m.last_price;
      const yesPct = Math.round(yesMid);
      return {
        id: m.ticker,
        platform: "kalshi",
        question: m.subtitle ? `${m.title} — ${m.subtitle}` : m.title,
        outcomes: [
          { label: "Yes", pricePct: yesPct },
          { label: "No", pricePct: 100 - yesPct },
        ],
        moreCount: 0,
        volumeUsd,
        date: m.close_time ?? null,
        url: `https://kalshi.com/markets/${m.ticker.toLowerCase()}`,
      };
    });
}

/**
 * Live top markets across both platforms, merged and sorted by volume. Sources are fetched
 * independently — if one platform's API is unreachable, the other's results still come back
 * instead of the whole call failing.
 */
export async function fetchTrendingMarkets(limit = 9): Promise<TrendingMarket[]> {
  const [poly, kalshi] = await Promise.allSettled([
    fetchTrendingPolymarketMarkets(limit),
    fetchTrendingKalshiMarkets(limit),
  ]);
  const results: TrendingMarket[] = [
    ...(poly.status === "fulfilled" ? poly.value : []),
    ...(kalshi.status === "fulfilled" ? kalshi.value : []),
  ];
  return results.sort((a, b) => b.volumeUsd - a.volumeUsd).slice(0, limit);
}
