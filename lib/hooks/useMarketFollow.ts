"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export interface MarketFollowRow {
  id: string;
  platform: string;
  marketId: string;
  question: string;
  url: string | null;
  allocationUsd: number;
  followedAt: string;
  lastAnalyzedAt: string | null;
}

/** "Copy a Kalshi market" — mirrors the AI's own read on a followed market into virtual paper trades, since Kalshi has no public trader data to copy instead. */
export function useMarketFollow() {
  const { status } = useSession();
  const [follows, setFollows] = useState<MarketFollowRow[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/market-follow");
    if (res.ok) {
      const data = await res.json();
      setFollows(data.follows ?? []);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (status === "authenticated") refresh();
    else if (status === "unauthenticated") setHydrated(true);
  }, [status, refresh]);

  const follow = useCallback(
    async (marketId: string, question: string, url: string | null, allocationUsd: number) => {
      await fetch("/api/market-follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "follow", marketId, question, url, allocationUsd }),
      });
      await refresh();
    },
    [refresh]
  );

  const unfollow = useCallback(
    async (marketId: string) => {
      await fetch("/api/market-follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unfollow", marketId }),
      });
      await refresh();
    },
    [refresh]
  );

  const syncNow = useCallback(async () => {
    setSyncing(true);
    try {
      await fetch("/api/market-follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      await refresh();
    } finally {
      setSyncing(false);
    }
  }, [refresh]);

  return { follows, hydrated, syncing, follow, unfollow, syncNow };
}
