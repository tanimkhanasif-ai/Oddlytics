"use client";

import { useCallback, useEffect, useState } from "react";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage";
import type { TrackedWallet } from "@/lib/types";

const STORAGE_KEY = "oddlytics_tracked_wallets_v1";

export function useTrackedWallets() {
  const [wallets, setWallets] = useState<TrackedWallet[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWallets(readLocalStorage(STORAGE_KEY, []));
    setHydrated(true);
  }, []);

  const isTracked = useCallback(
    (address: string) => wallets.some((w) => w.walletAddress === address),
    [wallets]
  );

  const track = useCallback((walletAddress: string, name: string | null) => {
    setWallets((prev) => {
      if (prev.some((w) => w.walletAddress === walletAddress)) return prev;
      const next = [{ walletAddress, name, trackedAt: new Date().toISOString() }, ...prev];
      writeLocalStorage(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const untrack = useCallback((walletAddress: string) => {
    setWallets((prev) => {
      const next = prev.filter((w) => w.walletAddress !== walletAddress);
      writeLocalStorage(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { wallets, hydrated, isTracked, track, untrack };
}
