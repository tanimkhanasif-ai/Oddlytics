import type { Platform } from "@/lib/types";

const OUTLINE_STYLES: Record<string, { label: string; className: string; initial: string }> = {
  polymarket: {
    label: "Polymarket",
    initial: "P",
    className: "border-violet/40 bg-violet/15 text-violet",
  },
  kalshi: {
    label: "Kalshi",
    initial: "K",
    className: "border-info/40 bg-info/15 text-info",
  },
  screenshot: {
    label: "Screenshot",
    initial: "S",
    className: "border-border bg-background/60 text-muted-foreground",
  },
};

/** Solid, filled-in style — used wherever a pick needs to stand out more than the subtle outline pill (e.g. analysis results). */
const SOLID_STYLES: Record<string, { label: string; className: string } | undefined> = {
  polymarket: { label: "Polymarket", className: "bg-[#1652f0] text-white" },
  kalshi: { label: "Kalshi", className: "bg-brand text-[color:var(--on-brand)]" },
};

/**
 * The small pill that says which exchange a market or trade came from. Every
 * live row in the app carries one, so it's always obvious whether a number is
 * Polymarket's or Kalshi's rather than a merged, unattributed feed.
 */
export default function PlatformBadge({
  platform,
  size = "sm",
  variant = "outline",
  className = "",
}: {
  platform: Platform | string;
  size?: "sm" | "xs";
  /** "solid" hides itself entirely for platforms with no real branding to show (e.g. plain screenshots) rather than showing a generic placeholder. */
  variant?: "outline" | "solid";
  className?: string;
}) {
  const pad = size === "xs" ? "gap-1 px-1.5 py-0.5 text-[9px]" : "gap-1.5 px-2 py-1 text-[10px]";

  if (variant === "solid") {
    const solid = SOLID_STYLES[platform];
    if (!solid) return null;
    return (
      <span
        className={`inline-flex shrink-0 items-center rounded-full font-bold uppercase tracking-wide shadow-[var(--glow-soft)] ${pad} ${solid.className} ${className}`}
      >
        {solid.label}
      </span>
    );
  }

  const s = OUTLINE_STYLES[platform] ?? OUTLINE_STYLES.screenshot;
  const dot = size === "xs" ? "h-3 w-3 text-[7px]" : "h-3.5 w-3.5 text-[8px]";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border font-bold uppercase tracking-wide ${pad} ${s.className} ${className}`}
    >
      <span className={`grid place-items-center rounded-full bg-current/20 font-black ${dot}`}>
        {s.initial}
      </span>
      {s.label}
    </span>
  );
}
