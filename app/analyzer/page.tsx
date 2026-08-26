"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, TrendingUp, Wand2 } from "lucide-react";
import AnalysisResultView from "@/components/AnalysisResultView";
import FeatureGate from "@/components/FeatureGate";
import { Arrow, GlowButton } from "@/components/landing/primitives";
import { useAnalysisHistory } from "@/lib/hooks/useAnalysisHistory";
import type { AnalysisResult, MarketQuote } from "@/lib/types";

type Platform = "polymarket" | "kalshi";

export default function AnalyzerPage() {
  return (
    <FeatureGate ctaLabel="Unlock AI Predictor">
      <Analyzer />
    </FeatureGate>
  );
}

function Analyzer() {
  const [linkOpen, setLinkOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>("polymarket");
  const [marketInput, setMarketInput] = useState("");
  const [capital, setCapital] = useState("");

  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [findingBest, setFindingBest] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const { record } = useAnalysisHistory();

  const capitalUsd = capital.trim() ? Number(capital) : undefined;

  async function handleResolveAndAnalyze() {
    setResolveError(null);
    setAnalyzeError(null);
    setResult(null);
    if (!marketInput.trim()) {
      setResolveError("Paste a market URL, slug, or ticker first.");
      return;
    }
    setResolving(true);
    try {
      const res = await fetch("/api/markets/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, input: marketInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch market data.");
      setQuote(data);
    } catch (err) {
      setResolveError(err instanceof Error ? err.message : "Failed to fetch market data.");
    } finally {
      setResolving(false);
    }
  }

  async function handleAnalyzeLive() {
    if (!quote) return;
    setAnalyzeError(null);
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "live",
          platform: quote.platform,
          question: quote.question,
          yesPrice: quote.yesPrice,
          noPrice: quote.noPrice,
          marketId: quote.id,
          capitalUsd,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
      record(data);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleFileChange(file: File | null) {
    if (!file) return;
    setResult(null);
    setAnalyzeError(null);
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
          body: JSON.stringify({ mode: "screenshot", imageBase64: base64, imageMediaType: mediaType, capitalUsd }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Analysis failed.");
        setResult(data);
        record(data);
      } catch (err) {
        setAnalyzeError(err instanceof Error ? err.message : "Analysis failed.");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleFindBestBet() {
    setAnalyzeError(null);
    setResult(null);
    setFindingBest(true);
    try {
      const res = await fetch("/api/analyze/best-pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capitalUsd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't find a pick right now.");
      setResult(data);
      record(data);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Couldn't find a pick right now.");
    } finally {
      setFindingBest(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand/40 bg-brand/[0.12]">
            <TrendingUp className="h-5 w-5 text-brand" />
          </span>
          <h2 className="text-lg font-bold text-foreground">Oddlytics AI Predictor</h2>
          <span className="rounded-md border border-brand/40 bg-brand/[0.12] px-2 py-0.5 text-xs font-semibold text-brand">
            Pro
          </span>
        </div>

        <div
          className="mt-6 cursor-pointer rounded-xl border border-dashed border-brand/35 bg-brand/[0.03] px-6 py-12 text-center transition-colors duration-200 hover:border-brand/60"
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt="Screenshot preview"
              className="mx-auto max-h-56 rounded-lg object-contain"
            />
          ) : (
            <>
              <ImagePlus className="mx-auto h-12 w-12 text-brand" strokeWidth={1.4} />
              <h3 className="mt-5 text-2xl font-bold text-foreground">
                Drop a screenshot of any market
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Our AI reads it and tells you the best pick to bet on in seconds
              </p>
            </>
          )}
          <GlowButton
            size="md"
            className="mx-auto mt-7"
            onClick={() => fileInputRef.current?.click()}
          >
            {analyzing ? "Analyzing…" : "Click here to add a market"} <Arrow />
          </GlowButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />
        </div>

        <button
          onClick={() => setLinkOpen((v) => !v)}
          className="ghost-button mt-4 w-full px-4 py-3.5 text-sm font-medium text-muted-foreground"
        >
          <Link2 className="h-4 w-4" /> Or paste a market link
        </button>

        {linkOpen && (
          <div className="mt-3 space-y-3 rounded-2xl border border-border bg-background/40 p-4">
            <div className="flex gap-2">
              <PlatformButton
                active={platform === "polymarket"}
                onClick={() => setPlatform("polymarket")}
              >
                Polymarket
              </PlatformButton>
              <PlatformButton active={platform === "kalshi"} onClick={() => setPlatform("kalshi")}>
                Kalshi
              </PlatformButton>
            </div>
            <input
              value={marketInput}
              onChange={(e) => setMarketInput(e.target.value)}
              placeholder={
                platform === "polymarket"
                  ? "https://polymarket.com/event/..."
                  : "https://kalshi.com/markets/... or TICKER"
              }
              className="w-full rounded-xl border border-brand/25 bg-brand/[0.05] px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand/50"
            />
            <button
              onClick={handleResolveAndAnalyze}
              disabled={resolving}
              className="ghost-button px-5 py-2 text-sm disabled:opacity-50"
            >
              {resolving ? "Fetching…" : "Fetch market data"}
            </button>
            {resolveError && <p className="text-sm text-down">{resolveError}</p>}
            {quote && (
              <div className="rounded-xl border border-border bg-background/50 p-3">
                <p className="text-sm text-foreground/90">{quote.question}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  YES {(quote.yesPrice * 100).toFixed(1)}¢ · NO {(quote.noPrice * 100).toFixed(1)}¢
                </p>
                <GlowButton size="sm" className="mt-3" onClick={handleAnalyzeLive}>
                  {analyzing ? "Analyzing…" : "Run AI analysis"}
                </GlowButton>
              </div>
            )}
          </div>
        )}

        <div className="mt-3">
          <label className="text-xs font-medium text-muted-foreground">
            Available trading capital (USD, optional)
          </label>
          <input
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            placeholder="e.g. 500"
            inputMode="decimal"
            className="mt-1 w-full rounded-xl border border-brand/25 bg-brand/[0.05] px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand/50"
          />
        </div>

        <GlowButton onClick={handleFindBestBet} className="mt-3 w-full py-3.5 text-base">
          <Wand2 className="h-4 w-4" />
          {findingBest ? "Scanning live markets…" : "Find me the perfect bet"}
        </GlowButton>

        {analyzeError && <p className="mt-3 text-sm text-down">{analyzeError}</p>}
      </div>

      {result && <AnalysisResultView result={result} />}
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
