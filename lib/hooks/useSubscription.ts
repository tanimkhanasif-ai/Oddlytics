"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useSubscription() {
  const { status } = useSession();
  const [subscribed, setSubscribed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async (): Promise<boolean> => {
    const res = await fetch("/api/subscription");
    const data = await res.json();
    const next = !!data.subscribed;
    setSubscribed(next);
    return next;
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      refresh().finally(() => setHydrated(true));
    } else if (status === "unauthenticated") {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const activate = useCallback(async () => {
    await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscribed: true }),
    });
    setSubscribed(true);
  }, []);

  const deactivate = useCallback(async () => {
    await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscribed: false }),
    });
    setSubscribed(false);
  }, []);

  return { subscribed, hydrated, activate, deactivate, refresh };
}
