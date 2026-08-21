"use client";

import { Lock } from "lucide-react";

interface LockedOverlayProps {
  unlocked: boolean;
  loading?: boolean;
  ctaLabel: string;
  onUnlock: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Wraps paywalled feature content: renders `children` normally when `unlocked`,
 * otherwise blurs them behind a centered unlock CTA. Shared by every feature page
 * per the "no feature is free" decision — replaces the inline blur pattern that
 * used to live only in Handpicked Bets.
 */
export default function LockedOverlay({
  unlocked,
  loading,
  ctaLabel,
  onUnlock,
  title = "Unlock this feature",
  subtitle = "Get full access with an Oddlytics subscription.",
  children,
}: LockedOverlayProps) {
  if (unlocked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-30 blur-md" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl border border-brand/30 bg-black/85 p-8 text-center shadow-glow backdrop-blur-md">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand text-black shadow-[0_8px_20px_-6px_rgba(34,197,94,0.7)]">
            <Lock className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <h2 className="mt-4 text-xl font-bold text-white">{title}</h2>
          <p className="mt-1.5 text-sm text-gray-400">{subtitle}</p>
          <button
            onClick={onUnlock}
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-black shadow-[0_10px_24px_-8px_rgba(34,197,94,0.7)] transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Opening checkout…" : ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
