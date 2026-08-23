"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, Plus, ChevronDown, Star } from "lucide-react";
import FeatureGate from "@/components/FeatureGate";
import PlatformBadge from "@/components/PlatformBadge";
import { Sparkline } from "@/components/app/Sparkline";
import { GlowButton } from "@/components/landing/primitives";
import { usePaperTrading } from "@/lib/hooks/usePaperTrading";
import { simulateCurrentPrice } from "@/lib/mocks/priceSimulator";
import type { TrendingMarket } from "@/lib/markets/topMarkets";
import type { PaperPosition, Platform } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

/** Deterministic wiggle so each row's sparkline differs without inventing price history. */
const series = (up: boolean, seed: number) =>
  Array.from({ length: 12 }, (_, i) => {
    const wave = Math.sin((i + seed) * 1.1) * 12;
    return (up ? i * 6 : -i * 6) + wave + 50;
  });

function compactUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}

export default function PaperTradingPage() {
  return (
    <FeatureGate ctaLabel="Start virtual trading">
      <PaperTrading />
    </FeatureGate>
  );
}

function PaperTrading() {
  const { cashUsd, positions, hydrated, openPosition, closePosition } = usePaperTrading();

  const [markets, setMarkets] = useState<TrendingMarket[]>([]);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [prefill, setPrefill] = useState<TrendingMarket | null>(null);

  useEffect(() => {
    fetch("/api/markets/trending?limit=7")
      .then((r) => r.json())
      .then((d) => setMarkets(d.markets ?? []))
      .catch(() => setMarkets([]));
  }, []);

  const openPositions = positions.filter((p) => p.status === "open");

  const unrealizedPnl = useMemo(
    () =>
      openPositions.reduce((sum, p) => {
        const current = simulateCurrentPrice(p.id, p.entryPrice, p.openedAt);
        return sum + ((p.sizeUsd / p.entryPrice) * current - p.sizeUsd);
      }, 0),
    [openPositions],
  );

  if (!hydrated) return null;

  const pnlUp = unrealizedPnl >= 0;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-6 rounded-3xl p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand/35 bg-brand/[0.12]">
            <Wallet className="h-5 w-5 text-brand" />
          </span>
          <div>
            <p className="text-xs tracking-widest text-muted-foreground">BALANCE</p>
            <p className="text-2xl font-bold text-foreground">{formatUsd(cashUsd)}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs tracking-widest text-muted-foreground">P&amp;L</p>
            <p className={`text-xl font-bold ${pnlUp ? "text-up" : "text-down"}`}>
              {pnlUp ? "+" : ""}
              {formatUsd(unrealizedPnl)}
            </p>
          </div>
          <Sparkline points={series(pnlUp, 1)} up={pnlUp} width={130} height={40} />
        </div>
      </div>

      <button
        onClick={() => setTradeOpen((o) => !o)}
        className="ghost-button w-full justify-between px-5 py-4 text-base font-medium"
      >
        <span className="flex items-center gap-3">
          <Plus className="h-4 w-4 text-brand" /> Enter Trade
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${tradeOpen ? "rotate-180" : ""}`}
        />
      </button>

      {tradeOpen && (
        <TradeForm
          cashUsd={cashUsd}
          prefill={prefill}
          onConsumePrefill={() => setPrefill(null)}
          onOpen={async (p) => {
            const ok = await openPosition(p);
            if (ok) setTradeOpen(false);
          }}
        />
      )}

      <div className="glass-panel overflow-hidden rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <Star className="h-6 w-6 text-brand" />
          <div>
            <h2 className="font-semibold text-foreground">Practice popular markets</h2>
            <p className="text-xs text-muted-foreground">Test your strategies with virtual money</p>
          </div>
        </div>

        {markets.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Live markets are loading — if this stays empty, the market APIs aren&apos;t reachable
            from this environment yet.
          </p>
        ) : (
          <>
            <div className="mt-4 divide-y divide-border">
              {markets.map((m, i) => (
                <MarketRow
                  key={`${m.platform}-${m.id}`}
                  market={m}
                  i={i}
                  onPick={() => {
                    setPrefill(m);
                    setTradeOpen(true);
                  }}
                />
              ))}
            </div>

          </>
        )}
      </div>

      {openPositions.length > 0 ? (
        <div className="glass-panel rounded-3xl p-5">
          <h2 className="font-semibold text-foreground">Open positions</h2>
          <div className="mt-3 divide-y divide-border">
            {openPositions.map((p) => (
              <PositionRow key={p.id} position={p} onClose={closePosition} />
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-2 text-center">
          <p className="text-sm text-muted-foreground">Enter your first virtual trade</p>
          <GlowButton onClick={() => setTradeOpen(true)} className="mx-auto mt-4 px-7 py-3">
            <Plus className="h-4 w-4" /> Enter Trade
          </GlowButton>
        </div>
      )}
    </div>
  );
}

function MarketRow({
  market,
  i,
  onPick,
}: {
  market: TrendingMarket;
  i: number;
  onPick: () => void;
}) {
  const pct = market.outcomes[0]?.pricePct ?? 50;
  const up = pct >= 50;
  return (
    <button
      onClick={onPick}
      className="flex w-full items-center gap-4 py-3.5 text-left transition-colors duration-200 hover:bg-foreground/[0.03]"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <PlatformBadge platform={market.platform} size="xs" />
          <span className="text-[10px] text-muted-foreground">
            Vol. {compactUsd(market.volumeUsd)}
          </span>
        </div>
        <p className="truncate text-sm font-medium text-foreground">{market.question}</p>
      </div>
      <span className={`text-sm font-semibold ${up ? "text-up" : "text-down"}`}>
        {up ? "+" : ""}
        {pct}%
      </span>
      <Sparkline points={series(up, i)} up={up} />
    </button>
  );
}

function PositionRow({
  position,
  onClose,
}: {
  position: PaperPosition;
  onClose: (id: string, exitPrice: number) => void;
}) {
  const current = simulateCurrentPrice(position.id, position.entryPrice, position.openedAt);
  const pnl = (position.sizeUsd / position.entryPrice) * current - position.sizeUsd;
  const up = pnl >= 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3.5">
      <div className="min-w-0">
        <div className="mb-1">
          <PlatformBadge platform={position.platform} size="xs" />
        </div>
        <p className="truncate text-sm font-medium text-foreground">{position.marketQuestion}</p>
        <p className="text-xs text-muted-foreground">
          {position.side} @ {(position.entryPrice * 100).toFixed(0)}¢ ·{" "}
          {formatUsd(position.sizeUsd)}
          {position.source === "copy-trading" && " · via Copy Trading"}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Current</p>
          <p className="text-sm text-foreground">{(current * 100).toFixed(0)}¢</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">P&amp;L</p>
          <p className={`text-sm font-semibold ${up ? "text-up" : "text-down"}`}>
            {formatUsd(pnl)}
          </p>
        </div>
        <button
          onClick={() => onClose(position.id, current)}
          className="ghost-button px-3 py-1.5 text-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function TradeForm({
  cashUsd,
  prefill,
  onConsumePrefill,
  onOpen,
}: {
  cashUsd: number;
  prefill: TrendingMarket | null;
  onConsumePrefill: () => void;
  onOpen: (p: Omit<PaperPosition, "id" | "openedAt" | "status">) => void;
}) {
  const [question, setQuestion] = useState("");
  const [platform, setPlatform] = useState<Platform>("polymarket");
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [entryCents, setEntryCents] = useState("50");
  const [size, setSize] = useState("100");

  useEffect(() => {
    if (!prefill) return;
    setQuestion(prefill.question);
    setPlatform(prefill.platform);
    setEntryCents(String(prefill.outcomes[0]?.pricePct ?? 50));
    onConsumePrefill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  function submit() {
    const entryPrice = Number(entryCents) / 100;
    const sizeUsd = Number(size);
    if (!question.trim() || !entryPrice || entryPrice <= 0 || entryPrice >= 1 || !sizeUsd) return;
    onOpen({ marketQuestion: question.trim(), platform, side, entryPrice, sizeUsd });
    setQuestion("");
  }

  const field =
    "w-full rounded-xl border border-brand/25 bg-brand/[0.05] px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand/50";

  return (
    <div className="glass-panel animate-fade-in space-y-3 rounded-3xl p-5">
      <p className="text-sm text-muted-foreground">
        Pick a market below to stage a virtual position. Nothing here uses real money.
      </p>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Market question"
        className={field}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          className={field}
        >
          <option value="polymarket">Polymarket</option>
          <option value="kalshi">Kalshi</option>
          <option value="screenshot">Screenshot</option>
        </select>
        <select
          value={side}
          onChange={(e) => setSide(e.target.value as "YES" | "NO")}
          className={field}
        >
          <option value="YES">YES</option>
          <option value="NO">NO</option>
        </select>
        <input
          value={entryCents}
          onChange={(e) => setEntryCents(e.target.value)}
          inputMode="numeric"
          placeholder="Entry price (¢)"
          className={field}
        />
        <input
          value={size}
          onChange={(e) => setSize(e.target.value)}
          inputMode="decimal"
          placeholder="Size (virtual USD)"
          className={field}
        />
      </div>
      <div className="flex items-center gap-3">
        <GlowButton size="sm" onClick={submit}>
          Open position
        </GlowButton>
        <span className="text-xs text-muted-foreground">Available: {formatUsd(cashUsd)}</span>
      </div>
    </div>
  );
}
