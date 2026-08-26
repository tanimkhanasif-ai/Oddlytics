"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { DropTime, GlowButton, Logo } from "./primitives";

/** Where the primary "Start winning smarter" CTA should go — straight to the
 *  dashboard for a signed-in visitor, signup for everyone else. */
export function usePrimaryCtaHref(): "/dashboard" | "/signup" {
  const { status } = useSession();
  return status === "authenticated" ? "/dashboard" : "/signup";
}

/** Looping countdown: counts down from 4:52:09 and restarts when it hits zero. */
export function useCountdown(initialSeconds = 4 * 3600 + 52 * 60 + 9) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s <= 0 ? initialSeconds : s - 1)), 1000);
    return () => clearInterval(id);
  }, [initialSeconds]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function OfferBar() {
  const time = useCountdown();
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="relative z-50 w-full bg-[linear-gradient(90deg,var(--brand),var(--brand-light),var(--brand))] px-10 py-2.5 text-center">
      <p className="text-sm font-semibold text-[color:var(--on-brand)] md:text-base">
        First week $1. Offer ends 11:59pm tonight: <DropTime value={time} />
      </p>
      <button
        type="button"
        aria-label="Dismiss offer"
        onClick={() => setOpen(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--on-brand)]/70 transition-colors hover:text-[color:var(--on-brand)]"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export function Nav() {
  const { status } = useSession();
  const loggedIn = status === "authenticated";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand/15 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-12 md:flex">
          {[
            ["Features", "#features"],
            ["FAQs", "#faqs"],
            ["Pricing", "#pricing"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="relative text-lg font-medium text-foreground/90 transition-colors hover:text-brand after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-right after:scale-x-0 after:bg-brand after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
            >
              {label}
            </a>
          ))}
        </nav>
        <GlowButton href={loggedIn ? "/dashboard" : "/signup"} className="hidden md:inline-flex">
          {loggedIn ? "Open Dashboard" : "Start winning smarter"}
        </GlowButton>
      </div>
    </header>
  );
}

const WINS = [
  { name: "Rachel P. from Boston, MA", amount: "$3,547", ago: "25 minutes ago" },
  { name: "Sarah K. from Los Angeles, CA", amount: "$423", ago: "27 minutes ago" },
  { name: "Marcus T. from Austin, TX", amount: "$1,208", ago: "31 minutes ago" },
  { name: "Devin R. from Chicago, IL", amount: "$862", ago: "38 minutes ago" },
];

export function WinToast() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setI((p) => (p + 1) % WINS.length);
        setVisible(true);
      }, 400);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const win = WINS[i] ?? WINS[0]!;

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 hidden w-[330px] rounded-2xl border border-brand/30 bg-card/90 p-4 shadow-[var(--glow-soft)] backdrop-blur-md transition-all duration-300 md:block ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand/40 bg-brand/10 text-brand shadow-[var(--glow-soft)]">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 17l6-6 4 4 8-8" />
            <path d="M15 7h6v6" />
          </svg>
        </span>

        <div className="text-sm">
          <p className="font-semibold text-foreground">{win.name}</p>
          <p className="text-foreground/80">
            Won <span className="font-semibold text-proof">{win.amount}</span> on their bet
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {win.ago} ·
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-proof" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path
                d="M8 12.5l2.5 2.5 5-5"
                stroke="var(--background)"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            verified by Proof
          </p>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/60 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
        <Logo />
        <p className="max-w-xl text-xs text-muted-foreground">
          Oddlytics provides research and analysis only. It never touches your money or wallet.
          Prediction markets carry risk. © {new Date().getFullYear()} Oddlytics.
        </p>
      </div>
    </footer>
  );
}
