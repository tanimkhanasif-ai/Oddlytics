"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ImagePlus, Link2, Sparkles, Wand2 } from "lucide-react";
import AppTopbar from "@/components/AppTopbar";
import AnalysisResultView from "@/components/AnalysisResultView";
import CoachChat from "@/components/CoachChat";
import LockedOverlay from "@/components/LockedOverlay";
import { useAnalysisHistory } from "@/lib/hooks/useAnalysisHistory";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { paddleConfigured, usePaddleCheckout } from "@/lib/hooks/usePaddleCheckout";
import type { AnalysisResult, MarketQuote } from "@/lib/types";

type Platform = "polymarket" | "kalshi";

export default function AnalyzerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { subscribed, hydrated: subHydrated, refresh } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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

  const { openCheckout } = usePaddleCheckout(refresh);

  function startCheckout() {
    if (!session?.user?.id) {
      router.push("/login?callbackUrl=/analyzer");
      return;
    }
    if (paddleConfigured) {
      setCheckoutLoading(true);
      const opened = openCheckout(session.user.id);
      setCheckoutLoading(false);
      if (opened) return;
    }
    router.push("/checkout/mock?redirect=/analyzer");
  }

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

  if (!subHydrated) return null;

  return (
    <div className="space-y-6">
      <AppTopbar title="Predictor" icon={Sparkles} />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <LockedOverlay
            unlocked={subscribed}
            loading={checkoutLoading}
            onUnlock={startCheckout}
            title="Unlock AI Predictor"
            subtitle={
              paddleConfigured
                ? "Run unlimited AI analysis on any market — secure checkout via Paddle."
                : "Run unlimited AI analysis on any market. Test mode — no payment provider configured yet, nothing will be charged."
            }
            ctaLabel="Upgrade to analyze"
          >
            <div className="rounded-2xl border border-brand/20 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-brand/40 bg-brand/10 text-brand-bright">
                  <Wand2 className="h-4 w-4" />
                </span>
                <h2 className="text-base font-semibold text-white">Oddlytics AI Predictor</h2>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Pro
                </span>
              </div>

              <div
                className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-brand/40 p-10 text-center hover:border-brand/70"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Screenshot preview" className="max-h-56 rounded-lg object-contain" />
                ) : (
                  <>
                    <span className="grid h-14 w-14 place-items-center rounded-xl border border-brand/40 text-brand-bright">
                      <ImagePlus className="h-6 w-6" />
                    </span>
                    <p className="text-base font-semibold text-white">Drop a screenshot of any market</p>
                    <p className="text-sm text-gray-500">Our AI reads it and tells you the best pick to bet on in seconds</p>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 rounded-full border border-brand/40 px-5 py-2 text-sm font-semibold text-brand-bright hover:bg-brand/10"
                >
                  Click here to add a market →
                </button>
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
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-4 py-3 text-sm text-gray-300 hover:bg-white/10"
              >
                <Link2 className="h-4 w-4" /> Or paste a market link
              </button>

              {linkOpen && (
                <div className="mt-3 space-y-3 rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="flex gap-2">
                    <PlatformButton active={platform === "polymarket"} onClick={() => setPlatform("polymarket")}>
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
                      platform === "polymarket" ? "https://polymarket.com/event/..." : "https://kalshi.com/markets/... or TICKER"
                    }
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-white/30"
                  />
                  <button
                    onClick={handleResolveAndAnalyze}
                    disabled={resolving}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
                  >
                    {resolving ? "Fetching…" : "Fetch market data"}
                  </button>
                  {resolveError && <p className="text-sm text-no">{resolveError}</p>}
                  {quote && (
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
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
                </div>
              )}

              <div className="mt-3">
                <label className="text-xs font-medium text-gray-500">Available trading capital (USD, optional)</label>
                <input
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  placeholder="e.g. 500"
                  inputMode="decimal"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-white/30"
                />
              </div>

              <button
                onClick={handleFindBestBet}
                disabled={findingBest}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-brand/40 py-3 text-sm font-semibold text-brand-bright hover:bg-brand/10 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {findingBest ? "Scanning live markets…" : "Find me the perfect bet"}
              </button>

              {analyzeError && <p className="mt-3 text-sm text-no">{analyzeError}</p>}
            </div>
          </LockedOverlay>

          {result && <AnalysisResultView result={result} />}
        </div>

        <div className="min-h-[420px] lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)]">
          <CoachChat context={result} />
        </div>
      </div>
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
      className={`rounded-md px-3 py-1.5 text-xs font-medium ${
        active ? "bg-white text-black" : "bg-white/10 text-gray-300 hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}
