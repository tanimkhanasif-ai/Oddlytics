import type { TrendingMarket } from "@/lib/markets/topMarkets";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatVolume(usd: number): string {
  if (usd >= 1000) return `$${Math.round(usd / 1000)}K`;
  return `$${Math.round(usd)}`;
}

interface HandpickedMarketCardProps {
  market: TrendingMarket;
  onViewPick: () => void;
  loading?: boolean;
}

export default function HandpickedMarketCard({ market, onViewPick, loading }: HandpickedMarketCardProps) {
  const isPoly = market.platform === "polymarket";
  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2">
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded text-[10px] font-bold ${
            isPoly ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"
          }`}
        >
          {isPoly ? "P" : "K"}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          {isPoly ? "Polymarket" : "Kalshi"}
        </span>
        <span className="text-[10px] text-gray-600">{formatDate(market.date)}</span>
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-white">{market.question}</h3>

      <div className="mt-3 space-y-1.5">
        {market.outcomes.map((o) => (
          <div key={o.label} className="flex items-center gap-2 text-xs">
            <span className="w-16 shrink-0 truncate text-gray-400">{o.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand" style={{ width: `${o.pricePct}%` }} />
            </div>
            <span className="w-9 shrink-0 rounded-full border border-white/10 py-0.5 text-center font-semibold text-gray-200">
              {o.pricePct}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
        <span>{formatVolume(market.volumeUsd)} vol</span>
        {market.moreCount > 0 && <span>{market.moreCount} more</span>}
      </div>

      <button
        onClick={onViewPick}
        disabled={loading}
        className="mt-3 rounded-full border border-brand/40 py-1.5 text-xs font-semibold text-brand-bright hover:bg-brand/10 disabled:opacity-50"
      >
        {loading ? "Analyzing…" : "View AI Pick"}
      </button>
    </div>
  );
}
