"use client";

import { useEffect, useState } from "react";
import type { TraderTrade } from "@/lib/types";

/**
 * Real, recent, sizeable Polymarket trades (see /api/traders/recent-activity) — not
 * fabricated testimonials or invented dollar figures. Fails silently if the feed is
 * unavailable rather than blocking the page.
 */
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
    const hideTimer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(hideTimer);
  }, [index, trades.length]);

  useEffect(() => {
    if (trades.length === 0) return;
    const rotate = setInterval(() => setIndex((i) => (i + 1) % trades.length), 10000);
    return () => clearInterval(rotate);
  }, [trades.length]);

  if (trades.length === 0 || !visible) return null;
  const trade = trades[index];
  const amount = trade.size * trade.price;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-xs rounded-lg border border-white/10 bg-[#111826] p-3 text-xs shadow-lg">
      <p className="font-medium text-white">Live Polymarket activity</p>
      <p className="mt-1 text-gray-400">
        A trader just {trade.side === "SELL" ? "sold" : "bought"} {trade.outcome ?? "a position"}{" "}
        on <span className="text-gray-300">{trade.question || trade.market}</span> for ~$
        {amount.toFixed(0)}.
      </p>
    </div>
  );
}
