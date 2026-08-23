import type { Platform } from "@/lib/types";

const STYLES: Record<string, { label: string; className: string; initial: string }> = {
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

/**
 * The small pill that says which exchange a market or trade came from. Every
 * live row in the app carries one, so it's always obvious whether a number is
 * Polymarket's or Kalshi's rather than a merged, unattributed feed.
 */
export default function PlatformBadge({
  platform,
  size = "sm",
  className = "",
}: {
  platform: Platform | string;
  size?: "sm" | "xs";
  className?: string;
}) {
  const s = STYLES[platform] ?? STYLES.screenshot;
  const pad = size === "xs" ? "gap-1 px-1.5 py-0.5 text-[9px]" : "gap-1.5 px-2 py-1 text-[10px]";
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
