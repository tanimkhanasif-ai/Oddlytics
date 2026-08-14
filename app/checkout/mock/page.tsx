"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function MockCheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session_id") || "mock_session";
  const [loading, setLoading] = useState(false);

  function pay() {
    setLoading(true);
    setTimeout(() => {
      router.push(`/handpicked-bets?checkout=success&session_id=${sessionId}`);
    }, 900);
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <p className="mb-4 rounded-md bg-yellow-500/10 px-3 py-2 text-xs font-medium text-yellow-400">
          TEST MODE — this is a mocked checkout page. No real payment is processed, and no Stripe
          keys are configured yet.
        </p>
        <h1 className="text-lg font-semibold text-white">Oddlytics Handpicked Bets</h1>
        <p className="mt-1 text-sm text-gray-400">Monthly access to curated, premium picks.</p>
        <p className="mt-4 text-2xl font-semibold text-white">
          $19.00 <span className="text-sm font-normal text-gray-500">/ month</span>
        </p>

        <div className="mt-5 space-y-2">
          <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-500">
            Card number — •••• •••• •••• 4242 (test)
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-500">
              12 / 34
            </div>
            <div className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-500">
              CVC
            </div>
          </div>
        </div>

        <button
          onClick={pay}
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {loading ? "Processing…" : "Pay $19.00 (test mode)"}
        </button>
        <button
          onClick={() => router.push("/handpicked-bets?checkout=cancelled")}
          className="mt-2 w-full rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function MockCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <MockCheckoutInner />
    </Suspense>
  );
}
