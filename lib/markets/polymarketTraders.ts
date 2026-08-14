/**
 * Real, unauthenticated Polymarket trader data — the public Data API
 * (https://data-api.polymarket.com) exposes on-chain leaderboard rankings
 * and per-wallet trade history since Polymarket wallets are public
 * blockchain addresses. This is genuinely live data, not mocked.
 *
 * Kalshi has no equivalent public endpoint: it's a CFTC-regulated exchange
 * with private, KYC'd accounts and no public leaderboard or per-user trade
 * API, so Wallet Tracker / Copy Trading only cover Polymarket. We don't
 * scrape or fake Kalshi trader data to fill the gap.
 */

const DATA_API_BASE = "https://data-api.polymarket.com";

export type LeaderboardPeriod = "DAY" | "WEEK" | "MONTH" | "ALL";

export interface TopTrader {
  rank: number;
  walletAddress: string;
  name: string | null;
  pnl: number;
  volume: number;
}

export interface TraderTrade {
  market: string;
  question: string | null;
  outcome: string | null;
  side: "BUY" | "SELL" | null;
  size: number;
  price: number;
  timestampMs: number;
}

/** Response field names aren't fully nailed down from docs alone, so read defensively across the plausible variants. */
function pickNumber(obj: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.trim() !== "") return v;
  }
  return null;
}

export async function fetchTopTraders(
  period: LeaderboardPeriod = "WEEK",
  limit = 10
): Promise<TopTrader[]> {
  const url = `${DATA_API_BASE}/v1/leaderboard?period=${period}&limit=${limit}&orderBy=PNL`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Polymarket leaderboard lookup failed (HTTP ${res.status}).`);
  }
  const data = await res.json();
  const rows: Record<string, unknown>[] = Array.isArray(data) ? data : data.traders || [];

  return rows.map((row, i) => ({
    rank: pickNumber(row, ["rank"]) || i + 1,
    walletAddress:
      pickString(row, ["wallet_address", "walletAddress", "proxyWallet", "address"]) || "",
    name: pickString(row, ["name", "userName", "username", "pseudonym"]),
    pnl: pickNumber(row, ["profit_loss", "profitLoss", "pnl", "profit"]),
    volume: pickNumber(row, ["volume", "vol"]),
  }));
}

export async function fetchTraderTrades(
  walletAddress: string,
  limit = 20
): Promise<TraderTrade[]> {
  const url = `${DATA_API_BASE}/trades?user=${encodeURIComponent(walletAddress)}&limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Polymarket trade history lookup failed (HTTP ${res.status}).`);
  }
  const data = await res.json();
  const rows: Record<string, unknown>[] = Array.isArray(data) ? data : data.trades || [];

  return rows.map((row) => {
    const side = pickString(row, ["side"]);
    const timestamp = pickNumber(row, ["timestamp", "matchTime", "createdAt"]);
    return {
      market: pickString(row, ["market", "conditionId", "asset_id", "assetId"]) || "",
      question: pickString(row, ["title", "question", "market_question"]),
      outcome: pickString(row, ["outcome"]),
      side: side === "BUY" || side === "SELL" ? side : null,
      size: pickNumber(row, ["size"]),
      price: pickNumber(row, ["price"]),
      timestampMs: timestamp > 1e12 ? timestamp : timestamp * 1000,
    };
  });
}

/** Recent sizeable trades across top traders, used for the (real, honestly-labeled) social-proof feed. */
export async function fetchRecentNotableTrades(limit = 8): Promise<TraderTrade[]> {
  const traders = await fetchTopTraders("DAY", 5);
  const results = await Promise.allSettled(
    traders.map((t) => fetchTraderTrades(t.walletAddress, 5))
  );
  const trades = results
    .filter((r): r is PromiseFulfilledResult<TraderTrade[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .filter((t) => t.size * t.price >= 50)
    .sort((a, b) => b.timestampMs - a.timestampMs);
  return trades.slice(0, limit);
}
