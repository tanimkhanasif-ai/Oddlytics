"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AnalysisResultView from "@/components/AnalysisResultView";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { paddleConfigured, usePaddleCheckout } from "@/lib/hooks/usePaddleCheckout";
import { getHandpickedBets } from "@/lib/mocks/handpicks";

/** Polls /api/subscription for up to ~10s waiting for the Paddle webhook to land. */
async function waitForSubscription(refresh: () => Promise<boolean>) {
  for (let i = 0; i < 7; i++) {
    if (await refresh()) return true;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return false;
}

export default function HandpickedBetsPage() {
  const { data: session } = useSession();
  const { subscribed, hydrated, refresh } = useSubscription();
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const { openCheckout } = usePaddleCheckout(async () => {
    setVerifying(true);
    await waitForSubscription(refresh);
    setVerifying(false);
  });

  function startCheckout() {
    if (!session?.user?.id) {
      router.push("/login?callbackUrl=/handpicked-bets");
      return;
    }
    if (paddleConfigured) {
      setCheckoutLoading(true);
      const opened = openCheckout(session.user.id);
      setCheckoutLoading(false);
      if (opened) return;
    }
    router.push("/checkout/mock?redirect=/handpicked-bets");
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
              disabled={checkoutLoading || verifying}
              className="mt-4 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black disabled:opacity-50"
            >
              {checkoutLoading ? "Opening checkout…" : "Unlock Handpicked Bets"}
            </button>
            <p className="mt-2 text-xs text-gray-500">
              {paddleConfigured
                ? "Secure checkout via Paddle."
                : "Test mode — no payment provider configured yet, nothing will be charged."}
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
