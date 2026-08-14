/**
 * Deterministic pseudo price-walk for open paper positions, since there's no live price
 * feed wired into Paper Trading yet. Same id + elapsed time window always yields the same
 * price, so the UI doesn't flicker between renders.
 */
export function simulateCurrentPrice(id: string, entryPrice: number, openedAt: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;

  const elapsedMinutes = Math.max(0, (Date.now() - new Date(openedAt).getTime()) / 60_000);
  const tick = Math.floor(elapsedMinutes / 5); // moves every 5 simulated minutes
  const drift = Math.sin(h + tick) * 0.08; // up to +/-8 cents of drift

  return Math.min(0.98, Math.max(0.02, entryPrice + drift));
}
