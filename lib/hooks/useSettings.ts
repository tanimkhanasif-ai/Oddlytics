"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useUsername() {
  const { status } = useSession();
  const [username, setUsernameState] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/account")
        .then((r) => r.json())
        .then((data) => setUsernameState(data.name ?? ""))
        .finally(() => setHydrated(true));
    } else if (status === "unauthenticated") {
      setHydrated(true);
    }
  }, [status]);

  const setUsername = useCallback(async (value: string) => {
    setUsernameState(value);
    await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value }),
    });
  }, []);

  return { username, hydrated, setUsername };
}
