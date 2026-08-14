"use client";

import { useRef, useState } from "react";
import AnalysisResultView from "@/components/AnalysisResultView";
import CoachChat from "@/components/CoachChat";
import type { AnalysisResult, MarketQuote } from "@/lib/types";

type Mode = "live" | "screenshot";
type Platform = "polymarket" | "kalshi";

export default function AnalyzerPage() {
  const [mode, setMode] = useState<Mode>("live");
  const [platform, setPlatform] = useState<Platform>("polymarket");
  const [marketInput, setMarketInput] = useState("");
  const [capital, setCapital] = useState("");

  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const capitalUsd = capital.trim() ? Number(capital) : undefined;

  async function handleResolve() {
    setResolveError(null);
    setQuote(null);
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
          capitalUsd,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleFileChange(file: File | null) {
    setImageFile(file);
    setResult(null);
    setAnalyzeError(null);
    if (!file) {
      setImagePreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleAnalyzeScreenshot() {
    if (!imagePreview) return;
    setAnalyzeError(null);
    setAnalyzing(true);
    try {
      const [header, base64] = imagePreview.split(",");
      const mediaType = header.match(/data:(.*);base64/)?.[1] || "image/png";
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "screenshot",
          imageBase64: base64,
          imageMediaType: mediaType,
          capitalUsd,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">AI Analyzer</h1>
          <p className="mt-1 text-sm text-gray-400">
            Pull a live Polymarket/Kalshi market or paste a screenshot, and get a structured read.
          </p>
        </div>

        <div className="flex gap-2">
          <ModeButton active={mode === "live"} onClick={() => setMode("live")}>
            Live market
          </ModeButton>
          <ModeButton active={mode === "screenshot"} onClick={() => setMode("screenshot")}>
            Screenshot
          </ModeButton>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          {mode === "live" ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <PlatformButton
                  active={platform === "polymarket"}
                  onClick={() => setPlatform("polymarket")}
                >
                  Polymarket
                </PlatformButton>
                <PlatformButton
                  active={platform === "kalshi"}
                  onClick={() => setPlatform("kalshi")}
                >
                  Kalshi
                </PlatformButton>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">
                  {platform === "polymarket"
                    ? "Polymarket market/event URL or slug"
                    : "Kalshi market URL or ticker"}
                </label>
                <input
                  value={marketInput}
                  onChange={(e) => setMarketInput(e.target.value)}
                  placeholder={
                    platform === "polymarket"
                      ? "https://polymarket.com/event/..."
                      : "https://kalshi.com/markets/... or TICKER"
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-white/30"
                />
              </div>
              <CapitalInput value={capital} onChange={setCapital} />
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                {resolving ? "Fetching…" : "Fetch market data"}
              </button>
              {resolveError && <p className="text-sm text-no">{resolveError}</p>}

              {quote && (
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-gray-300">{quote.question}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    YES {(quote.yesPrice * 100).toFixed(1)}¢ · NO {(quote.noPrice * 100).toFixed(1)}¢
                  </p>
                  <button
                    onClick={handleAnalyzeLive}
                    disabled={analyzing}
                    className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
                  >
                    {analyzing ? "Analyzing…" : "Run AI analysis"}
                  </button>
                </div>
              )}
              {analyzeError && <p className="text-sm text-no">{analyzeError}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 p-8 text-center hover:border-white/40"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt="Screenshot preview"
                    className="max-h-64 rounded-lg object-contain"
                  />
                ) : (
                  <p className="text-sm text-gray-400">
                    Click to upload a screenshot of a prediction-market question
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
              </div>
              <CapitalInput value={capital} onChange={setCapital} />
              <button
                onClick={handleAnalyzeScreenshot}
                disabled={!imagePreview || analyzing}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                {analyzing ? "Analyzing…" : "Run AI analysis"}
              </button>
              {analyzeError && <p className="text-sm text-no">{analyzeError}</p>}
            </div>
          )}
        </div>

        {result && <AnalysisResultView result={result} />}
      </div>

      <div className="min-h-[420px] lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)]">
        <CoachChat context={result} />
      </div>
    </div>
  );
}

function ModeButton({
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
      className={`rounded-lg px-4 py-2 text-sm font-medium ${
        active ? "bg-white text-black" : "bg-white/10 text-gray-300 hover:bg-white/20"
      }`}
    >
      {children}
    </button>
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
      className={`rounded-md px-3 py-1.5 text-xs font-medium ${
        active ? "bg-white text-black" : "bg-white/10 text-gray-300 hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}

function CapitalInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-400">
        Available trading capital (USD, optional)
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 500"
        inputMode="decimal"
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-white/30"
      />
    </div>
  );
}
