"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { AnalysisResult } from "@/lib/types";

export interface AnalysisHistoryItem {
  id: string;
  analyzedAt: string;
  result: AnalysisResult;
}

export function useAnalysisHistory() {
  const { status } = useSession();
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/analysis-history")
        .then((r) => r.json())
        .then((data) => setHistory(data.history ?? []))
        .finally(() => setHydrated(true));
    } else if (status === "unauthenticated") {
      setHydrated(true);
    }
  }, [status]);

  const record = useCallback((result: AnalysisResult) => {
    setHistory((prev) => [
      { id: `local-${Date.now()}`, analyzedAt: new Date().toISOString(), result },
      ...prev,
    ]);
    fetch("/api/analysis-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result }),
    }).catch(() => {});
  }, []);

  return { history, hydrated, record };
}
