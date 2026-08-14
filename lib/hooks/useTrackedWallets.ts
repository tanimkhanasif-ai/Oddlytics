"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { TrackedWallet } from "@/lib/types";

export function useTrackedWallets() {
  const { status } = useSession();
  const [wallets, setWallets] = useState<TrackedWallet[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/wallets");
    if (res.ok) {
      const data = await res.json();
      setWallets(data.wallets ?? []);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (status === "authenticated") refresh();
    else if (status === "unauthenticated") setHydrated(true);
  }, [status, refresh]);

  const isTracked = useCallback(
    (address: string) => wallets.some((w) => w.walletAddress === address),
    [wallets]
  );

  const track = useCallback(
    async (walletAddress: string, name: string | null) => {
      await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, name }),
      });
      await refresh();
    },
    [refresh]
  );

  const untrack = useCallback(
    async (walletAddress: string) => {
      await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "untrack", walletAddress }),
      });
      await refresh();
    },
    [refresh]
  );

  return { wallets, hydrated, isTracked, track, untrack };
}
