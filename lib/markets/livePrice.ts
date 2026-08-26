import { fetchPolymarketQuote } from "@/lib/markets/polymarket";
import { fetchKalshiQuote } from "@/lib/markets/kalshi";

/**
 * Real, live YES price for a position's backing market, for re-pricing open
 * Paper Trading positions instead of the simulated walk. `marketId` is a
 * Polymarket event slug or a Kalshi ticker (see PaperPosition.marketId) —
 * both quote fetchers already accept a bare slug/ticker string, so this
 * reuses the same proven lookups the market-resolve flow uses, rather than
 * a new endpoint. Returns null on any failure so callers can fall back
 * gracefully instead of breaking the whole P&L calculation.
 */
export async function fetchLiveYesPrice(
  platform: string,
  marketId: string | null | undefined
): Promise<number | null> {
  if (!marketId) return null;
  try {
    if (platform === "kalshi") {
      const quote = await fetchKalshiQuote(marketId);
      return quote.yesPrice;
    }
    if (platform === "polymarket") {
      const quote = await fetchPolymarketQuote(marketId);
      return quote.yesPrice;
    }
    return null;
  } catch {
    return null;
  }
}
