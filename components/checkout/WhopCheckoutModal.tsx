"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { X } from "lucide-react";

const WhopCheckoutEmbed = dynamic(
  () => import("@whop/checkout/react").then((m) => m.WhopCheckoutEmbed),
  { ssr: false }
);

const ENVIRONMENT: "production" | "sandbox" =
  process.env.NEXT_PUBLIC_WHOP_ENV === "production" ? "production" : "sandbox";

export function WhopCheckoutModal({
  sessionId,
  onClose,
  onCompleted,
}: {
  sessionId: string;
  onClose: () => void;
  onCompleted: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-background p-2 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close checkout"
          className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
        >
          <X className="h-4 w-4" />
        </button>
        <WhopCheckoutEmbed
          sessionId={sessionId}
          environment={ENVIRONMENT}
          theme="dark"
          themeOptions={{ accentColor: "green" }}
          returnUrl={typeof window !== "undefined" ? `${window.location.origin}/pricing` : undefined}
          onComplete={() => onCompleted()}
          onPaymentError={(err) => setError(err.message)}
        />
        {error && <p className="px-4 pb-3 text-center text-xs text-down">{error}</p>}
      </div>
    </div>
  );
}
