"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { CopyTradingFollow } from "@/lib/types";

export interface MirroredTradeEvent {
  traderLabel: string;
  question: string;
  outcome: string | null;
  price: number;
  sizeUsd: number;
  at: string;
}

export function useCopyTrading() {
  const { status } = useSession();
  const [follows, setFollows] = useState<CopyTradingFollow[]>([]);
  const [feed, setFeed] = useState<MirroredTradeEvent[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/copy-trading");
    if (res.ok) {
      const data = await res.json();
      setFollows(data.follows ?? []);
      setFeed(data.feed ?? []);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (status === "authenticated") refresh();
    else if (status === "unauthenticated") setHydrated(true);
  }, [status, refresh]);

  const follow = useCallback(
    async (walletAddress: string, name: string | null, allocationUsd: number) => {
      await fetch("/api/copy-trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "follow", walletAddress, name, allocationUsd }),
      });
      await refresh();
    },
    [refresh]
  );

  const unfollow = useCallback(
    async (walletAddress: string) => {
      await fetch("/api/copy-trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unfollow", walletAddress }),
      });
      await refresh();
    },
    [refresh]
  );

  const syncNow = useCallback(async () => {
    setSyncing(true);
    try {
      await fetch("/api/copy-trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      await refresh();
    } finally {
      setSyncing(false);
    }
  }, [refresh]);

  return { follows, hydrated, syncing, feed, follow, unfollow, syncNow };
}
