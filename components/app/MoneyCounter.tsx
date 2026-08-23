"use client";

import { useEffect, useState } from "react";

function Digit({ value }: { value: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden align-bottom">
      <span
        className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-[700ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ transform: `translateY(-${value}em)` }}
      >
        {Array.from({ length: 10 }).map((_, n) => (
          <span key={n} className="flex h-[1em] items-center justify-center leading-none">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

const WON_KEY = "oddlytics-personal-won";

/**
 * Money total whose digits roll up smoothly each time the number ticks.
 * Persists per visitor so it keeps climbing from where they left off.
 */
export function MoneyCounter({
  start = 3261863,
  className = "",
}: {
  start?: number;
  className?: string;
}) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(WON_KEY));
    let current = Number.isFinite(stored) && stored > start ? stored : start;
    setValue(current);

    const id = setInterval(() => {
      current += Math.floor(Math.random() * 400) + 60;
      setValue(current);
      window.localStorage.setItem(WON_KEY, String(current));
    }, 2200);
    return () => clearInterval(id);
  }, [start]);

  const chars = `$${value.toLocaleString("en-US")}+`.split("");

  return (
    <span className={`inline-flex items-end tabular-nums leading-none ${className}`}>
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <Digit key={i} value={Number(c)} />
        ) : (
          <span key={i} className="inline-block leading-none">
            {c}
          </span>
        ),
      )}
    </span>
  );
}
