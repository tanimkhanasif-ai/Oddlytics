"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { PaperPosition } from "@/lib/types";

interface ApiPosition {
  id: string;
  marketQuestion: string;
  platform: string;
  marketId: string | null;
  side: "YES" | "NO";
  entryPrice: number;
  sizeUsd: number;
  openedAt: string;
  status: "open" | "closed";
  closedAt: string | null;
  exitPrice: number | null;
  source: string | null;
  sourceTraderAddress: string | null;
  livePrice: number | null;
}

function mapPosition(r: ApiPosition): PaperPosition {
  return {
    id: r.id,
    marketQuestion: r.marketQuestion,
    platform: r.platform as PaperPosition["platform"],
    marketId: r.marketId ?? undefined,
    side: r.side,
    entryPrice: r.entryPrice,
    sizeUsd: r.sizeUsd,
    openedAt: r.openedAt,
    status: r.status,
    closedAt: r.closedAt ?? undefined,
    exitPrice: r.exitPrice ?? undefined,
    source: (r.source as PaperPosition["source"]) ?? undefined,
    sourceTraderAddress: r.sourceTraderAddress ?? undefined,
    livePrice: r.livePrice ?? undefined,
  };
}

export function usePaperTrading() {
  const { status } = useSession();
  const [cashUsd, setCashUsd] = useState(0);
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/paper-trading");
    if (res.ok) {
      const data = await res.json();
      setCashUsd(data.cashUsd ?? 0);
      setPositions((data.positions ?? []).map(mapPosition));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (status === "authenticated") refresh();
    else if (status === "unauthenticated") setHydrated(true);
  }, [status, refresh]);

  const openPosition = useCallback(
    async (p: Omit<PaperPosition, "id" | "openedAt" | "status">): Promise<boolean> => {
      const res = await fetch("/api/paper-trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "open", ...p }),
      });
      if (res.ok) await refresh();
      return res.ok;
    },
    [refresh]
  );

  const closePosition = useCallback(
    async (id: string, exitPrice: number) => {
      const res = await fetch("/api/paper-trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close", id, exitPrice }),
      });
      if (res.ok) await refresh();
    },
    [refresh]
  );

  const reset = useCallback(async () => {
    await fetch("/api/paper-trading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    await refresh();
  }, [refresh]);

  return { cashUsd, positions, hydrated, openPosition, closePosition, reset };
}
