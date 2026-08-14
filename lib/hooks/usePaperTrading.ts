"use client";

import { useCallback, useEffect, useState } from "react";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage";
import type { PaperPosition, PaperTradingState } from "@/lib/types";

const STORAGE_KEY = "oddlytics_paper_trading_v1";
const STARTING_CASH = 1000;

function initialState(): PaperTradingState {
  return { cashUsd: STARTING_CASH, positions: [] };
}

export function usePaperTrading() {
  const [state, setState] = useState<PaperTradingState>(initialState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readLocalStorage(STORAGE_KEY, initialState()));
    setHydrated(true);
  }, []);

  const openPosition = useCallback(
    (p: Omit<PaperPosition, "id" | "openedAt" | "status">) => {
      setState((prev) => {
        if (p.sizeUsd <= 0 || p.sizeUsd > prev.cashUsd) return prev;
        const position: PaperPosition = {
          ...p,
          id: `pp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          openedAt: new Date().toISOString(),
          status: "open",
        };
        const next: PaperTradingState = {
          cashUsd: prev.cashUsd - p.sizeUsd,
          positions: [position, ...prev.positions],
        };
        writeLocalStorage(STORAGE_KEY, next);
        return next;
      });
    },
    []
  );

  const closePosition = useCallback((id: string, exitPrice: number) => {
    setState((prev) => {
      let payout = 0;
      const positions = prev.positions.map((pos) => {
        if (pos.id !== id || pos.status !== "open") return pos;
        const shares = pos.sizeUsd / pos.entryPrice;
        payout = shares * exitPrice;
        return { ...pos, status: "closed" as const, closedAt: new Date().toISOString(), exitPrice };
      });
      const next: PaperTradingState = { cashUsd: prev.cashUsd + payout, positions };
      writeLocalStorage(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const next = initialState();
    writeLocalStorage(STORAGE_KEY, next);
    setState(next);
  }, []);

  return { ...state, hydrated, openPosition, closePosition, reset };
}
