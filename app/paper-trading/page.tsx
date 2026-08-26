"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Wallet, Plus, ChevronDown, Star, Link2, ImagePlus } from "lucide-react";
import FeatureGate from "@/components/FeatureGate";
import PlatformBadge from "@/components/PlatformBadge";
import AnalysisResultView from "@/components/AnalysisResultView";
import { Sparkline } from "@/components/app/Sparkline";
import { GlowButton } from "@/components/landing/primitives";
import { usePaperTrading } from "@/lib/hooks/usePaperTrading";
import { simulateCurrentPrice } from "@/lib/mocks/priceSimulator";
import type { TrendingMarket } from "@/lib/markets/topMarkets";
import type { AnalysisResult, PaperPosition } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

/** Deterministic wiggle so each row's sparkline differs without inventing price history. */
const series = (up: boolean, seed: number) =>
  Array.from({ length: 12 }, (_, i) => {
    const wave = Math.sin((i + seed) * 1.1) * 12;
    return (up ? i * 6 : -i * 6) + wave + 50;
  });

function closedPnl(p: PaperPosition): number {
  const exit = p.exitPrice ?? p.entryPrice;
  return (p.sizeUsd / p.entryPrice) * exit - p.sizeUsd;
}

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

type TradeMode = "link" | "screenshot";

function PaperTrading() {
  const { cashUsd, positions, hydrated, closePosition, refresh } = usePaperTrading();

  const [markets, setMarkets] = useState<TrendingMarket[]>([]);
  const [marketsCollapsed, setMarketsCollapsed] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeMode, setTradeMode] = useState<TradeMode>("link");
  const [prefill, setPrefill] = useState<TrendingMarket | null>(null);

  useEffect(() => {
    fetch("/api/markets/trending?limit=7")
      .then((r) => r.json())
      .then((d) => setMarkets(d.markets ?? []))
      .catch(() => setMarkets([]));
  }, []);

  const openPositions = positions.filter((p) => p.status === "open");
  const closedPositions = positions.filter((p) => p.status === "closed");

  const unrealizedPnl = useMemo(
    () =>
      openPositions.reduce((sum, p) => {
        const current = p.livePrice ?? simulateCurrentPrice(p.id, p.entryPrice, p.openedAt);
        return sum + ((p.sizeUsd / p.entryPrice) * current - p.sizeUsd);
      }, 0),
    [openPositions],
  );

  const { winRate, wins } = useMemo(() => {
    if (closedPositions.length === 0) return { winRate: null as number | null, wins: 0 };
    const winCount = closedPositions.filter((p) => closedPnl(p) > 0).length;
    return { winRate: Math.round((winCount / closedPositions.length) * 100), wins: winCount };
  }, [closedPositions]);

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
          {winRate != null && (
            <div className="text-right">
              <p className="text-xs tracking-widest text-muted-foreground">WIN RATE</p>
              <p className={`text-xl font-bold ${winRate >= 50 ? "text-up" : "text-down"}`}>
                {winRate}%
              </p>
              <p className="text-[10px] text-muted-foreground">
                {wins}/{closedPositions.length} trades
              </p>
            </div>
          )}
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
        <div className="glass-panel animate-fade-in space-y-4 rounded-3xl p-5">
          <div className="flex gap-2">
            <ModeTab active={tradeMode === "link"} onClick={() => setTradeMode("link")}>
              <Link2 className="h-3.5 w-3.5" /> Paste link
            </ModeTab>
            <ModeTab active={tradeMode === "screenshot"} onClick={() => setTradeMode("screenshot")}>
              <ImagePlus className="h-3.5 w-3.5" /> Screenshot
            </ModeTab>
          </div>

          {tradeMode === "link" && (
            <LinkAnalyzeForm
              prefill={prefill}
              onConsumePrefill={() => setPrefill(null)}
              onOpened={() => { refresh(); setTradeOpen(false); }}
            />
          )}
          {tradeMode === "screenshot" && (
            <ScreenshotAnalyzeForm onOpened={() => { refresh(); setTradeOpen(false); }} />
          )}
        </div>
      )}

      <div className="glass-panel overflow-hidden rounded-3xl p-5">
        <button
          onClick={() => setMarketsCollapsed((c) => !c)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex items-center gap-3">
            <Star className="h-6 w-6 text-brand" />
            <span>
              <h2 className="font-semibold text-foreground">Practice popular markets</h2>
              <p className="text-xs text-muted-foreground">Test your strategies with virtual money</p>
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
              marketsCollapsed ? "" : "rotate-180"
            }`}
          />
        </button>

        {!marketsCollapsed &&
          (markets.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Live markets are loading — if this stays empty, the market APIs aren&apos;t reachable
              from this environment yet.
            </p>
          ) : (
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
          ))}
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

      {closedPositions.length > 0 && (
        <div className="glass-panel rounded-3xl p-5">
          <h2 className="font-semibold text-foreground">Trade history</h2>
          <div className="mt-3 divide-y divide-border">
            {closedPositions.map((p) => (
              <ClosedTradeRow key={p.id} position={p} />
            ))}
          </div>
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
  const isLive = position.livePrice != null;
  const current = position.livePrice ?? simulateCurrentPrice(position.id, position.entryPrice, position.openedAt);
  const pnl = (position.sizeUsd / position.entryPrice) * current - position.sizeUsd;
  const up = pnl >= 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3.5">
      <div className="min-w-0">
        <div className="mb-1">
          <PlatformBadge platform={position.platform} size="xs" variant="solid" />
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
          <p className="text-xs text-muted-foreground">
            Current {isLive && <span className="text-up">· live</span>}
          </p>
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

function ClosedTradeRow({ position }: { position: PaperPosition }) {
  const pnl = closedPnl(position);
  const won = pnl > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3.5">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <PlatformBadge platform={position.platform} size="xs" variant="solid" />
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              won ? "bg-up/20 text-up" : "bg-down/20 text-down"
            }`}
          >
            {won ? "Win" : "Loss"}
          </span>
        </div>
        <p className="truncate text-sm font-medium text-foreground">{position.marketQuestion}</p>
        <p className="text-xs text-muted-foreground">
          {position.side} @ {(position.entryPrice * 100).toFixed(0)}¢ → exit{" "}
          {((position.exitPrice ?? position.entryPrice) * 100).toFixed(0)}¢ ·{" "}
          {formatUsd(position.sizeUsd)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">P&amp;L</p>
        <p className={`text-sm font-semibold ${won ? "text-up" : "text-down"}`}>
          {won ? "+" : ""}
          {formatUsd(pnl)}
        </p>
        <p className={`text-[10px] ${won ? "text-up" : "text-down"}`}>
          {won ? "+" : ""}
          {((pnl / position.sizeUsd) * 100).toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-brand text-[color:var(--on-brand)]"
          : "border border-brand/30 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function LinkAnalyzeForm({
  prefill,
  onConsumePrefill,
  onOpened,
}: {
  prefill: TrendingMarket | null;
  onConsumePrefill: () => void;
  onOpened: () => void;
}) {
  const [platform, setPlatform] = useState<"polymarket" | "kalshi">("polymarket");
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!prefill) return;
    setPlatform(prefill.platform);
    setInput(prefill.id);
    onConsumePrefill();
    analyze(prefill.platform, prefill.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  async function analyze(overridePlatform?: "polymarket" | "kalshi", overrideInput?: string) {
    const usePlatform = overridePlatform ?? platform;
    const useInput = (overrideInput ?? input).trim();
    if (!useInput) return;
    setError(null);
    setAnalyzing(true);
    try {
      const resolveRes = await fetch("/api/markets/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: usePlatform, input: useInput }),
      });
      const quote = await resolveRes.json();
      if (!resolveRes.ok) throw new Error(quote.error || "Failed to fetch market data.");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "live",
          platform: quote.platform,
          question: quote.question,
          yesPrice: quote.yesPrice,
          noPrice: quote.noPrice,
          marketId: quote.id,
        }),
      });
      const data = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAnalyzing(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-3">
        <AnalysisResultView result={result} onOpened={onOpened} />
        <button
          onClick={() => setResult(null)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Analyze another market
        </button>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-brand/25 bg-brand/[0.05] px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand/50";

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Paste a market link and the AI will analyze it, then you can paper trade the pick.
      </p>
      <div className="flex gap-2">
        <PlatformButton active={platform === "polymarket"} onClick={() => setPlatform("polymarket")}>
          Polymarket
        </PlatformButton>
        <PlatformButton active={platform === "kalshi"} onClick={() => setPlatform("kalshi")}>
          Kalshi
        </PlatformButton>
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          platform === "polymarket"
            ? "https://polymarket.com/event/..."
            : "https://kalshi.com/markets/... or TICKER"
        }
        className={field}
      />
      <GlowButton size="sm" onClick={analyze} disabled={analyzing}>
        {analyzing ? "Analyzing…" : "Analyze"}
      </GlowButton>
      {error && <p className="text-sm text-down">{error}</p>}
    </div>
  );
}

function ScreenshotAnalyzeForm({ onOpened }: { onOpened: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  function handleFile(file: File | null) {
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      const [header, base64] = dataUrl.split(",");
      const mediaType = header.match(/data:(.*);base64/)?.[1] || "image/png";
      setAnalyzing(true);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "screenshot", imageBase64: base64, imageMediaType: mediaType }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Analysis failed.");
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed.");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }

  if (result) {
    return (
      <div className="space-y-3">
        <AnalysisResultView result={result} onOpened={onOpened} />
        <button
          onClick={() => {
            setResult(null);
            setImagePreview(null);
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Analyze another screenshot
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Upload a market screenshot and the AI will analyze it, then you can paper trade the pick.
      </p>
      <div
        className="cursor-pointer rounded-xl border border-dashed border-brand/35 bg-brand/[0.03] px-6 py-10 text-center transition-colors duration-200 hover:border-brand/60"
        onClick={() => fileInputRef.current?.click()}
      >
        {imagePreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreview}
            alt="Screenshot preview"
            className="mx-auto max-h-40 rounded-lg object-contain"
          />
        ) : (
          <ImagePlus className="mx-auto h-8 w-8 text-brand" strokeWidth={1.4} />
        )}
        <GlowButton size="sm" className="mx-auto mt-4" onClick={() => fileInputRef.current?.click()}>
          {analyzing ? "Analyzing…" : "Click to add a screenshot"}
        </GlowButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
      </div>
      {error && <p className="text-sm text-down">{error}</p>}
    </div>
  );
}

function PlatformButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-brand text-[color:var(--on-brand)]"
          : "border border-brand/30 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
