"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnalysisResultView from "@/components/AnalysisResultView";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { getHandpickedBets } from "@/lib/mocks/handpicks";

function HandpickedBetsInner() {
  const { subscribed, hydrated, activate } = useSubscription();
  const params = useSearchParams();
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const checkoutState = params.get("checkout");
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (checkoutState === "success" && sessionId) {
      setVerifying(true);
      fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.paid) activate();
        })
        .finally(() => {
          setVerifying(false);
          router.replace("/handpicked-bets");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutState, sessionId]);

  async function startCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "handpicked" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setCheckoutLoading(false);
    }
  }

  const bets = getHandpickedBets();

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Handpicked Bets</h1>
        <p className="mt-1 text-sm text-gray-400">
          Curated, premium picks reviewed and refreshed regularly.
        </p>
      </div>

      {verifying && <p className="text-sm text-gray-400">Confirming your subscription…</p>}
      {checkoutState === "cancelled" && (
        <p className="text-sm text-gray-400">Checkout was cancelled — no charge was made.</p>
      )}

      {subscribed ? (
        <div className="grid gap-4">
          {bets.map((b) => (
            <div key={b.id}>
              <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                {b.category} · {new Date(b.postedAt).toLocaleDateString()}
              </p>
              <AnalysisResultView result={b.analysis} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <h2 className="text-lg font-medium text-white">Unlock Handpicked Bets</h2>
            <p className="mt-1 text-sm text-gray-400">
              $19/month for curated picks across sports, politics, and macro markets.
            </p>
            <button
              onClick={startCheckout}
              disabled={checkoutLoading}
              className="mt-4 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
            >
              {checkoutLoading ? "Redirecting…" : "Unlock Handpicked Bets"}
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Test mode — no Stripe keys configured yet, nothing will be charged.
            </p>
          </div>
          <div className="pointer-events-none grid gap-4 opacity-40 blur-sm select-none">
            {bets.slice(0, 2).map((b) => (
              <AnalysisResultView key={b.id} result={b.analysis} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HandpickedBetsPage() {
  return (
    <Suspense fallback={null}>
      <HandpickedBetsInner />
    </Suspense>
  );
}
