"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

const CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;
const ENVIRONMENT: "production" | "sandbox" =
  process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox";

/** Whether real Paddle checkout can run at all — false falls back to the mocked /checkout/mock flow. */
export const paddleConfigured = Boolean(CLIENT_TOKEN && PRICE_ID);

/** Loads Paddle.js once and exposes a function to open the real overlay checkout. */
export function usePaddleCheckout(onCompleted: () => void) {
  const paddleRef = useRef<Paddle | undefined>(undefined);
  const onCompletedRef = useRef(onCompleted);
  onCompletedRef.current = onCompleted;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!paddleConfigured || !CLIENT_TOKEN) return;
    let cancelled = false;
    initializePaddle({
      environment: ENVIRONMENT,
      token: CLIENT_TOKEN,
      eventCallback: (event) => {
        if (event.name === "checkout.completed") onCompletedRef.current();
      },
    }).then((instance) => {
      if (cancelled) return;
      paddleRef.current = instance;
      setReady(Boolean(instance));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const openCheckout = useCallback((userId: string): boolean => {
    if (!paddleRef.current || !PRICE_ID) return false;
    paddleRef.current.Checkout.open({
      items: [{ priceId: PRICE_ID, quantity: 1 }],
      customData: { userId },
    });
    return true;
  }, []);

  return { ready, openCheckout };
}
