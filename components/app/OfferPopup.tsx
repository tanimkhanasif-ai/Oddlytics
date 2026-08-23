"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Zap } from "lucide-react";
import { useSubscription } from "@/lib/hooks/useSubscription";

const INTERVAL_MS = 60_000;
const OFFER_SECONDS = 5 * 60;

/** Periodic upsell modal. Never shown to subscribers or on the pricing page itself. */
export function OfferPopup() {
  const pathname = usePathname() || "/";
  const { subscribed, hydrated } = useSubscription();
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(OFFER_SECONDS);

  useEffect(() => {
    const id = setInterval(() => setOpen(true), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLeft(OFFER_SECONDS);
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (pathname.startsWith("/pricing")) setOpen(false);
  }, [pathname]);

  if (!open || pathname.startsWith("/pricing") || (hydrated && subscribed)) return null;

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-md"
        onClick={() => setOpen(false)}
      />
      <div className="glass-panel reveal relative w-full max-w-md rounded-3xl p-7 text-center">
        <button
          aria-label="Close offer"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 text-muted-foreground transition-transform duration-200 hover:scale-110 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-2xl font-bold text-foreground">Still thinking it over?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The best investment you&apos;ll make is{" "}
          <span className="font-semibold text-brand">betting on yourself</span>.
        </p>

        <div className="mt-6 rounded-xl border border-brand/30 bg-brand/[0.06] px-4 py-3.5 text-sm font-semibold tracking-wide">
          OFFER EXPIRES IN{" "}
          <span className="text-glow tabular-nums text-brand">
            00:{mm}:{ss}
          </span>
        </div>

        <Link
          href="/pricing"
          onClick={() => setOpen(false)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,var(--brand-light),var(--brand))] px-6 py-3.5 text-base font-semibold text-[color:var(--on-brand)] shadow-[var(--glow-brand)] transition hover:-translate-y-0.5"
        >
          Claim My $1 First Week <Zap className="h-4 w-4 fill-current" />
        </Link>

        <button
          onClick={() => setOpen(false)}
          className="mt-4 w-full text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          No thanks, I&apos;ll pass
        </button>
      </div>
    </div>
  );
}
