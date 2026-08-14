"use client";

import { useCallback, useEffect, useState } from "react";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage";

const STORAGE_KEY = "oddlytics_subscribed_v1";

export function useSubscription() {
  const [subscribed, setSubscribed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSubscribed(readLocalStorage(STORAGE_KEY, false));
    setHydrated(true);
  }, []);

  const activate = useCallback(() => {
    writeLocalStorage(STORAGE_KEY, true);
    setSubscribed(true);
  }, []);

  const deactivate = useCallback(() => {
    writeLocalStorage(STORAGE_KEY, false);
    setSubscribed(false);
  }, []);

  return { subscribed, hydrated, activate, deactivate };
}
