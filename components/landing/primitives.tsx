"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pill button with a periodic shine sweep and press-pop, ported from the landing
 * design reference. Renders as a link when `href` is set so the real app's CTAs work.
 */
export function GlowButton({
  children,
  className,
  variant = "green",
  size = "md",
  seesaw = false,
  href,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  variant?: "green" | "light";
  size?: "sm" | "md" | "lg";
  seesaw?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const [shining, setShining] = useState(false);
  const [rocking, setRocking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = () => {
    if (timer.current) clearTimeout(timer.current);
    setShining(false);
    requestAnimationFrame(() => setShining(true));
    timer.current = setTimeout(() => setShining(false), 850);
  };

  useEffect(() => {
    const id = setInterval(fire, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!seesaw) return;
    const id = setInterval(() => {
      setRocking(false);
      requestAnimationFrame(() => setRocking(true));
      setTimeout(() => setRocking(false), 2050);
    }, 7000);
    return () => clearInterval(id);
  }, [seesaw]);

  const classes = cn(
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold tracking-tight transition-transform duration-300 will-change-transform hover:-translate-y-0.5",
    variant === "green" &&
      "bg-[linear-gradient(180deg,var(--brand-light),var(--brand))] text-[color:var(--on-brand)] shadow-[var(--glow-brand)]",
    variant === "light" &&
      "bg-[linear-gradient(180deg,var(--sheet-top),var(--sheet-bottom))] text-[color:var(--on-brand)] shadow-[var(--glow-soft)]",
    size === "sm" && "px-4 py-2 text-sm",
    size === "md" && "px-6 py-3 text-base",
    size === "lg" && "px-10 py-5 text-xl md:text-2xl",
    shining && "btn-shining",
    rocking && "btn-seesaw",
    className,
  );

  const inner = (
    <>
      <span className="relative z-10 flex items-center gap-3">{children}</span>
      <span className="shine-streak z-20" />
      <span className="shine-streak shine-streak-2 z-20" />
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={fire} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        fire();
        onClick?.();
      }}
      className={classes}
    >
      {inner}
    </button>
  );
}

/** Renders each character in its own cell so digit changes animate individually. */
export function DropTime({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex tabular-nums", className)}>
      {value.split("").map((ch, i) => (
        <span key={`${i}-${ch}`} className="digit-cell">
          <span>{ch}</span>
        </span>
      ))}
    </span>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block transition-transform duration-300 group-hover:translate-x-1.5",
        className,
      )}
    >
      →
    </span>
  );
}

export function Stars({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-brand text-[color:var(--on-brand)]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
          </svg>
        </span>
      ))}
    </span>
  );
}

export function VerifiedBadge({ label = "verified by Proof" }: { label?: string }) {
  return (
    <span className="flex items-center gap-2 text-muted-foreground">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-proof" fill="currentColor">
        <path d="M12 1.5l2.5 2 3.2-.3 1 3 2.8 1.6-1.2 3 1.2 3-2.8 1.6-1 3-3.2-.3-2.5 2-2.5-2-3.2.3-1-3L2.5 15l1.2-3-1.2-3 2.8-1.6 1-3 3.2.3 2.5-2z" />
        <path
          d="M8.4 12.2l2.4 2.4 4.8-4.8"
          stroke="var(--background)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-foreground/85">{label}</span>
    </span>
  );
}

const AVATAR_TONES = [
  "oklch(0.72 0.09 40)",
  "oklch(0.62 0.11 20)",
  "oklch(0.68 0.07 260)",
  "oklch(0.75 0.08 90)",
  "oklch(0.6 0.09 150)",
];

export function AvatarRow({ count = 3, size = 34 }: { count?: number; size?: number }) {
  return (
    <span className="flex -space-x-2">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          style={{ width: size, height: size, background: AVATAR_TONES[i % AVATAR_TONES.length] }}
          className="inline-flex items-center justify-center overflow-hidden rounded-full ring-2 ring-background"
        >
          <svg viewBox="0 0 32 32" className="h-full w-full opacity-80">
            <circle cx="16" cy="12" r="6" fill="oklch(0.28 0.02 260)" />
            <ellipse cx="16" cy="30" rx="11" ry="9" fill="oklch(0.32 0.02 260)" />
          </svg>
        </span>
      ))}
    </span>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand/40 bg-brand/10 shadow-[var(--glow-soft)]">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-brand"
          fill="none"
          strokeWidth="2.6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M15 7h6v6" />
        </svg>
      </span>
      <span className="text-2xl font-bold tracking-tight text-foreground">Oddlytics</span>
    </span>
  );
}
