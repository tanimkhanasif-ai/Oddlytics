"use client";

import { useEffect, useState } from "react";
import { TrendingUp, BadgeCheck } from "lucide-react";
import type { TraderTrade } from "@/lib/types";
import { truncate } from "@/lib/utils";

/**
 * Real, recent, sizeable Polymarket trades (see /api/traders/recent-activity) — not
 * fabricated testimonials or invented dollar figures. Fails silently if the feed is
 * unavailable rather than blocking the page. Where a trader has a real, self-set
 * Polymarket display name we show it; otherwise a generic non-human-implying label —
 * we never invent a human name or location.
 */

function formatRelativeTime(timestampMs: number): string {
  const diffMs = Date.now() - timestampMs;
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

export default function SocialProofToast() {
  const [trades, setTrades] = useState<TraderTrade[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/traders/recent-activity")
      .then((r) => r.json())
      .then((data) => setTrades(data.trades ?? []))
      .catch(() => setTrades([]));
  }, []);

  useEffect(() => {
    if (trades.length === 0) return;
    setVisible(true);
    const hideTimer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(hideTimer);
  }, [index, trades.length]);

  useEffect(() => {
    if (trades.length === 0) return;
    // Real data supports a fast 5s rotation; fall back to a slower cadence with too few trades
    // to avoid rapidly repeating the same one.
    const intervalMs = trades.length >= 2 ? 5000 : 15000;
    const rotate = setInterval(() => setIndex((i) => (i + 1) % trades.length), intervalMs);
    return () => clearInterval(rotate);
  }, [trades.length]);

  if (trades.length === 0 || !visible) return null;
  const trade = trades[index];
  const amount = trade.size * trade.price;
  const label = trade.traderName || "A Polymarket trader";

  return (
    <div className="fixed bottom-4 left-4 z-40 w-72 rounded-xl border border-white/10 bg-[#0c1410] p-3.5 shadow-lg shadow-black/40">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-bright">
          <TrendingUp className="h-4.5 w-4.5" strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{label}</p>
          <p className="text-sm text-gray-300">
            {trade.side === "SELL" ? "Sold" : "Bought"} {trade.outcome ?? "a position"} on{" "}
            <span className="text-gray-400">{truncate(trade.question || trade.market, 40)}</span> for{" "}
            <span className="font-semibold text-brand-bright">${amount.toFixed(0)}</span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            {formatRelativeTime(trade.timestampMs)}
            <BadgeCheck className="h-3.5 w-3.5 text-blue-400" /> live trade
          </p>
        </div>
      </div>
    </div>
  );
}
