"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function MockCheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/handpicked-bets";
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    try {
      await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribed: true }),
      });
    } finally {
      router.push(redirectTo);
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto grid max-w-4xl gap-10 px-6 py-16 sm:grid-cols-2">
        <div>
          <p className="rounded-md bg-yellow-50 px-3 py-2 text-xs font-medium text-yellow-700">
            TEST MODE — this is a mocked checkout page. No real payment is processed. Set
            NEXT_PUBLIC_PADDLE_CLIENT_TOKEN / NEXT_PUBLIC_PADDLE_PRICE_ID to use real Paddle
            checkout instead.
          </p>
          <div className="mt-8 flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded bg-gray-900 text-xs font-bold text-white">
              O
            </span>
            <span className="text-sm text-gray-500">Oddlytics.app</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Unlock Instant Access</p>
          <p className="mt-6 text-sm text-gray-500">Subscribe to All-Access</p>
          <p className="text-3xl font-semibold text-gray-900">$1</p>

          <div className="mt-8 space-y-2 border-t border-gray-200 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total due today</span>
              <span className="font-medium text-gray-900">$1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total after 7 days</span>
              <span className="text-gray-700">$19 per month</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Email</label>
          <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
            you@example.com
          </div>

          <label className="mt-4 block text-xs font-medium text-gray-600">Card information</label>
          <div className="mt-1 space-y-px">
            <div className="rounded-t-lg border border-gray-200 px-3 py-2 text-sm text-gray-400">
              1234 1234 1234 1234
            </div>
            <div className="flex">
              <div className="flex-1 rounded-bl-lg border border-t-0 border-gray-200 px-3 py-2 text-sm text-gray-400">
                MM / YY
              </div>
              <div className="flex-1 rounded-br-lg border border-t-0 border-l-0 border-gray-200 px-3 py-2 text-sm text-gray-400">
                CVC
              </div>
            </div>
          </div>

          <label className="mt-4 block text-xs font-medium text-gray-600">Name on card</label>
          <div className="mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400">
            Full name
          </div>

          <button
            onClick={pay}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing…" : "Pay $1.00 (test mode)"}
          </button>
          <button
            onClick={() => router.push(redirectTo)}
            className="mt-2 w-full py-2 text-xs text-gray-400 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
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
