"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, Check, Flame, Star, TrendingUp } from "lucide-react";
import { GlowButton } from "@/components/landing/primitives";
import { MoneyCounter } from "@/components/app/MoneyCounter";
import { ProofBadge } from "@/components/app/ProofBadge";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { useAppConfig } from "@/lib/hooks/useAppConfig";

const PERKS = [
  ["Unlimited AI analysis", "on any market"],
  ["Smart copy trading", "to follow top traders automatically"],
  ["Daily high-conviction picks", "from our AI"],
  ["Live wallet tracking", "of top-performing traders"],
  ["Paper trading", "to refine your strategy risk-free"],
];

/** Polls /api/subscription for up to ~10s waiting for the Whop webhook to land. */
async function waitForSubscription(refresh: () => Promise<boolean>) {
  for (let i = 0; i < 7; i++) {
    if (await refresh()) return true;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return false;
}

// useSearchParams() opts a page into client-side rendering unless it's
// isolated behind a Suspense boundary, so this stays a separate leaf
// component rather than living directly in PricingPage.
function CheckoutReturnWatcher({ onReturn }: { onReturn: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("checkout") !== "complete") return;
    router.replace("/pricing");
    onReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}

export default function PricingPage() {
  const { data: session } = useSession();
  const { subscribed, hydrated, refresh } = useSubscription();
  const config = useAppConfig();
  const whopConfigured = config?.whopEnabled ?? false;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Whop's redirect_url sends the buyer's whole tab back here after checkout
  // (no in-page callback) — pick that up and poll for the webhook.
  function handleCheckoutReturn() {
    setVerifying(true);
    waitForSubscription(refresh).finally(() => setVerifying(false));
  }

  async function startCheckout() {
    if (!session?.user?.id) {
      router.push("/login?callbackUrl=/pricing");
      return;
    }
    if (whopConfigured) {
      setLoading(true);
      try {
        const res = await fetch("/api/whop/checkout-session", { method: "POST" });
        const data = await res.json();
        if (res.ok && data.url) {
          window.location.href = data.url;
          return;
        }
      } finally {
        setLoading(false);
      }
    }
    router.push("/checkout/mock?redirect=/pricing");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-4">
      <Suspense fallback={null}>
        <CheckoutReturnWatcher onReturn={handleCheckoutReturn} />
      </Suspense>
      <div className="flex justify-center">
        <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
          <Flame className="h-4 w-4 text-brand" />
          First week $1. Offer ends 11:59pm tonight.
        </span>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Trusted by <span className="font-semibold text-brand">28k+ traders</span>
          </p>
          <span className="rounded-full border border-brand/40 bg-brand/10 px-3.5 py-1.5 text-xs font-semibold text-brand">
            One win pays for your whole month
          </span>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/45 bg-brand/[0.12] shadow-[var(--glow-soft)]">
            <TrendingUp className="h-7 w-7 text-brand" />
          </span>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Full Access</h2>
            <p className="text-sm text-muted-foreground">
              Complete access to everything Oddlytics has to offer.
            </p>
          </div>
        </div>

        <p className="mt-6 flex flex-wrap items-center gap-3 text-4xl font-bold text-foreground">
          Just <span className="text-muted-foreground line-through decoration-2">$29</span>
          <span className="text-glow text-brand">$1</span>
          <span className="rounded-full border border-brand/40 bg-brand/[0.12] px-2.5 py-1 text-sm font-semibold text-brand">
            -97%
          </span>
        </p>

        {hydrated && subscribed ? (
          <div className="mt-6 rounded-2xl border border-up/30 bg-up/10 px-4 py-3.5 text-center text-sm font-semibold text-up">
            You&apos;re already on Full Access.
          </div>
        ) : (
          <GlowButton
            onClick={startCheckout}
            className="mt-6 w-full px-6 py-4 text-lg"
            seesaw
          >
            {verifying
              ? "Confirming your subscription…"
              : loading
                ? "Opening checkout…"
                : "Try for $1 only"}{" "}
            <ArrowRight className="h-5 w-5" />
          </GlowButton>
        )}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {whopConfigured
            ? "Secure checkout via Whop."
            : "Test mode — no payment provider connected yet, nothing will be charged."}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="flex h-6 w-6 items-center justify-center rounded bg-brand/90">
                <Star className="h-3.5 w-3.5 fill-background text-background" />
              </span>
            ))}
          </div>
          <span className="font-semibold text-foreground">4.9/5</span>
          <span className="h-4 w-px bg-border" />
          <ProofBadge />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-muted-foreground">
          {["Instant access", "Cancel anytime", "Secure checkout"].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand" /> {t}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-card space-y-3.5 rounded-3xl p-6 sm:p-8">
        {PERKS.map(([bold, rest]) => (
          <p key={bold} className="flex items-start gap-3 text-base">
            <Check className="mt-1 h-4 w-4 shrink-0 text-brand" />
            <span>
              <span className="font-semibold text-foreground">{bold}</span>{" "}
              <span className="text-muted-foreground">{rest}</span>
            </span>
          </p>
        ))}
      </div>

      <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand/40 bg-brand/[0.12]">
            <TrendingUp className="h-5 w-5 text-brand" />
          </span>
          <div className="text-sm">
            <p className="font-semibold text-foreground">Sarah K. from Los Angeles, CA</p>
            <p className="text-muted-foreground">
              Won <span className="font-semibold text-proof">$423</span> on their bet
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              27 minutes ago · <ProofBadge className="text-xs" />
            </p>
          </div>
        </div>
        <p className="text-sm font-medium">
          <MoneyCounter className="text-glow font-bold text-proof" /> won by people like you
        </p>
      </div>
    </div>
  );
}
