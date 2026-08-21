"use client";

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
      <div className="pointer-events-none select-none opacity-40 blur-sm" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-brand/30 bg-black/80 p-6 text-center shadow-glow backdrop-blur">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
          <button
            onClick={onUnlock}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-dark via-brand to-brand-bright px-6 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Opening checkout…" : ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
