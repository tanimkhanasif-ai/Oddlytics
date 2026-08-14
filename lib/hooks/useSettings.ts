"use client";

import { useCallback, useEffect, useState } from "react";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage";

const STORAGE_KEY = "oddlytics_username_v1";

export function useUsername() {
  const [username, setUsernameState] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUsernameState(readLocalStorage(STORAGE_KEY, ""));
    setHydrated(true);
  }, []);

  const setUsername = useCallback((value: string) => {
    setUsernameState(value);
    writeLocalStorage(STORAGE_KEY, value);
  }, []);

  return { username, hydrated, setUsername };
}
