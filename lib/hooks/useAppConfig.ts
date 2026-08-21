"use client";

import { useEffect, useState } from "react";
import type { AppConfig } from "@/lib/types";

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then((r) => r.json())
      .then((data: AppConfig) => {
        if (!cancelled) setConfig(data);
      })
      .catch(() => {
        if (!cancelled) setConfig({ aiEnabled: false, paddleEnabled: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}
