"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useSubscription() {
  const { status } = useSession();
  const [subscribed, setSubscribed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/subscription")
        .then((r) => r.json())
        .then((data) => setSubscribed(!!data.subscribed))
        .finally(() => setHydrated(true));
    } else if (status === "unauthenticated") {
      setHydrated(true);
    }
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

  return { subscribed, hydrated, activate, deactivate };
}
