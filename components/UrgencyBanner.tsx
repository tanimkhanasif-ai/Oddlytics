"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "oddlytics_banner_dismissed";

/** Real wall-clock deadline: today at 23:59:59 local time (tomorrow's if that's already passed). */
function getTonightDeadline(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d.getTime();
}

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
    setDeadline(getTonightDeadline());
    setNow(Date.now());
    if (window.sessionStorage.getItem(DISMISS_KEY)) setDismissed(true);
    const interval = setInterval(() => {
      const n = Date.now();
      setNow(n);
      // Roll over to the next night's deadline the instant this one hits zero.
      setDeadline((d) => (d !== null && n >= d ? getTonightDeadline() : d));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!deadline || now === null || dismissed) return null;
  const remaining = deadline - now;

  return (
    <div className="relative z-20 flex items-center justify-center gap-3 bg-gradient-to-r from-brand-dark via-brand to-brand-bright px-4 py-2.5 text-center text-xs font-semibold text-black sm:text-sm">
      <span>
        🔥 First week $1 (placeholder pricing). Offer ends 11:59pm tonight: {formatRemaining(remaining)}
      </span>
      <button
        onClick={() => {
          window.sessionStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
        }}
        aria-label="Dismiss"
        className="shrink-0 text-black/60 hover:text-black"
      >
        ✕
      </button>
    </div>
  );
}
