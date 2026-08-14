"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOfferDeadline } from "@/lib/promo";

const DISMISS_KEY = "oddlytics_banner_dismissed";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function UrgencyBanner() {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDeadline(getOfferDeadline());
    setNow(Date.now());
    if (window.sessionStorage.getItem(DISMISS_KEY)) setDismissed(true);
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!deadline || now === null || dismissed) return null;
  const remaining = deadline - now;
  if (remaining <= 0) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-blue-600 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
      <span>
        Placeholder promo — first week for $1, pricing not finalized. Ends in{" "}
        {formatRemaining(remaining)}.{" "}
        <Link href="/pricing" className="underline">
          See pricing
        </Link>
      </span>
      <button
        onClick={() => {
          window.sessionStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
        }}
        aria-label="Dismiss"
        className="shrink-0 text-white/70 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
