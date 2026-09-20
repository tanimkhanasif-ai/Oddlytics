"use client";

import { useEffect, useState } from "react";
import { ANALYSIS_LIMIT } from "@/lib/analysisLimit";

/** Shown wherever an /api/analyze call comes back limitExceeded — analyzer page and Virtual Trading alike. */
export default function AnalysisCountdown({
  resetAt,
  onExpire,
}: {
  resetAt: string;
  onExpire: () => void;
}) {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, new Date(resetAt).getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      const ms = new Date(resetAt).getTime() - Date.now();
      if (ms <= 0) {
        clearInterval(id);
        onExpire();
      } else {
        setRemainingMs(ms);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [resetAt, onExpire]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="mt-3 flex flex-col items-center rounded-2xl border border-brand/30 bg-brand/[0.05] p-6 text-center">
      <p className="text-sm font-semibold text-foreground">Analysis limit reached</p>
      <p className="mt-1 text-xs text-muted-foreground">
        You&apos;ve used all {ANALYSIS_LIMIT} analyses for this 24-hour period. Next slot opens in:
      </p>
      <div className="mt-4 flex items-center justify-center gap-1.5">
        <TimeUnit label="hrs" digits={pad(h)} />
        <span className="pb-4 text-3xl font-bold text-brand/50">:</span>
        <TimeUnit label="min" digits={pad(m)} />
        <span className="pb-4 text-3xl font-bold text-brand/50">:</span>
        <TimeUnit label="sec" digits={pad(s)} />
      </div>
    </div>
  );
}

function TimeUnit({ label, digits }: { label: string; digits: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-1">
        {digits.split("").map((d, i) => (
          <span
            key={i}
            className="digit-cell flex h-12 w-9 items-center justify-center rounded-lg border border-brand/30 bg-brand/[0.12] text-2xl font-bold tabular-nums text-brand shadow-[var(--glow-soft)] sm:h-14 sm:w-11 sm:text-3xl"
          >
            <span key={d}>{d}</span>
          </span>
        ))}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
