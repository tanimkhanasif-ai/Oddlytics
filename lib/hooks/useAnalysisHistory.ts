"use client";

import { useCallback, useEffect, useState } from "react";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage";
import type { AnalysisResult } from "@/lib/types";

const STORAGE_KEY = "oddlytics_analysis_history_v1";
const MAX_ITEMS = 10;

export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHistory(readLocalStorage(STORAGE_KEY, []));
    setHydrated(true);
  }, []);

  const record = useCallback((result: AnalysisResult) => {
    setHistory((prev) => {
      const next = [result, ...prev].slice(0, MAX_ITEMS);
      writeLocalStorage(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { history, hydrated, record };
}
