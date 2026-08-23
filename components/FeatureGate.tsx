"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { GlowButton } from "@/components/landing/primitives";
import { useSubscription } from "@/lib/hooks/useSubscription";

/**
 * The paywall every feature sits behind. No feature is free, so there are two doors:
 *
 *   - signed out -> the login page, with a callback back to here
 *   - signed in, not subscribed -> the real live data still loads and renders,
 *     but blurred, with one CTA that sends them to the pricing page
 *
 * Blurring real rows rather than hiding them is deliberate: what's behind the
 * blur is genuine live Polymarket/Kalshi data, so the preview isn't a mockup.
 * The blur is only the polite half though — the endpoints that cost money
 * enforce the same rule server-side (see lib/session.ts).
 */
export default function FeatureGate({
  ctaLabel,
  children,
}: {
  /** Feature-specific call to action, e.g. "Set up copytrading". */
  ctaLabel: string;
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { subscribed, hydrated } = useSubscription();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  // Don't flash paywalled content before we know which door applies.
  if (status === "loading" || !hydrated || status === "unauthenticated") return null;

  if (subscribed) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[7px]" aria-hidden="true">
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <GlowButton onClick={() => router.push("/pricing")} className="px-7 py-4 text-base">
          <Plus className="h-5 w-5" strokeWidth={2.6} />
          {ctaLabel}
        </GlowButton>
      </div>
    </div>
  );
}
