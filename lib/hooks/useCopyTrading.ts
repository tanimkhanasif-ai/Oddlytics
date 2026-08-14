"use client";

import { useCallback, useEffect, useState } from "react";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage";
import { usePaperTrading } from "@/lib/hooks/usePaperTrading";
import type { CopyTradingFollow, TraderTrade } from "@/lib/types";

const STORAGE_KEY = "oddlytics_copy_trading_v1";
/** Each mirrored trade spends this fraction of the trader's allocation — an approximation, not a full portfolio simulation. */
const MIRROR_SLICE_FRACTION = 0.1;

export interface MirroredTradeEvent {
  traderLabel: string;
  trade: TraderTrade;
  sizeUsd: number;
  at: string;
}

export function useCopyTrading() {
  const [follows, setFollows] = useState<CopyTradingFollow[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [feed, setFeed] = useState<MirroredTradeEvent[]>([]);
  const { openPosition, cashUsd } = usePaperTrading();

  useEffect(() => {
    setFollows(readLocalStorage(STORAGE_KEY, []));
    setFeed(readLocalStorage("oddlytics_copy_trading_feed_v1", []));
    setHydrated(true);
  }, []);

  const persistFollows = useCallback((next: CopyTradingFollow[]) => {
    setFollows(next);
    writeLocalStorage(STORAGE_KEY, next);
  }, []);

  const follow = useCallback(
    (walletAddress: string, name: string | null, allocationUsd: number) => {
      persistFollows(
        [
          {
            walletAddress,
            name,
            allocationUsd,
            followedAt: new Date().toISOString(),
            lastSeenTradeTimestampMs: Date.now(),
          },
          ...follows.filter((f) => f.walletAddress !== walletAddress),
        ]
      );
    },
    [follows, persistFollows]
  );

  const unfollow = useCallback(
    (walletAddress: string) => {
      persistFollows(follows.filter((f) => f.walletAddress !== walletAddress));
    },
    [follows, persistFollows]
  );

  const syncNow = useCallback(async () => {
    if (follows.length === 0) return;
    setSyncing(true);
    let remainingCash = cashUsd;
    const newFeedEvents: MirroredTradeEvent[] = [];

    try {
      const updated: CopyTradingFollow[] = [];
      for (const f of follows) {
        try {
          const res = await fetch(`/api/traders/${f.walletAddress}/trades?limit=10`);
          const data = await res.json();
          const trades: TraderTrade[] = data.trades ?? [];
          const newTrades = trades
            .filter((t) => t.timestampMs > f.lastSeenTradeTimestampMs)
            .filter(
              (t) =>
                t.side === "BUY" &&
                t.outcome &&
                ["yes", "no"].includes(t.outcome.toLowerCase()) &&
                t.price > 0 &&
                t.price < 1
            )
            .sort((a, b) => a.timestampMs - b.timestampMs);

          for (const t of newTrades) {
            const sizeUsd = Math.min(f.allocationUsd * MIRROR_SLICE_FRACTION, remainingCash);
            if (sizeUsd < 1) continue;
            openPosition({
              marketQuestion: t.question || t.market,
              platform: "polymarket",
              side: t.outcome!.toLowerCase() === "yes" ? "YES" : "NO",
              entryPrice: t.price,
              sizeUsd,
              source: "copy-trading",
              sourceTraderAddress: f.walletAddress,
            });
            remainingCash -= sizeUsd;
            newFeedEvents.unshift({
              traderLabel: f.name || f.walletAddress,
              trade: t,
              sizeUsd,
              at: new Date().toISOString(),
            });
          }

          updated.push({
            ...f,
            lastSeenTradeTimestampMs: newTrades.length
              ? newTrades[newTrades.length - 1].timestampMs
              : f.lastSeenTradeTimestampMs,
          });
        } catch {
          updated.push(f);
        }
      }
      persistFollows(updated);
      if (newFeedEvents.length) {
        setFeed((prev) => {
          const next = [...newFeedEvents, ...prev].slice(0, 30);
          writeLocalStorage("oddlytics_copy_trading_feed_v1", next);
          return next;
        });
      }
    } finally {
      setSyncing(false);
    }
  }, [follows, cashUsd, openPosition, persistFollows]);

  return { follows, hydrated, syncing, feed, follow, unfollow, syncNow };
}
