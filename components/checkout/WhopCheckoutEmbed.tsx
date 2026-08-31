"use client";

import { useState } from "react";
import { loadWhop } from "@whop/elements";
import { WhopElements, Checkout, CheckoutElement } from "@whop/elements-react";

// This module is only ever loaded client-side (via next/dynamic ssr:false in
// WhopCheckoutModal), so calling loadWhop() at import time — which injects a
// <script> tag — is safe. It's idempotent: one script, one shared promise.
const elements = loadWhop();

export function WhopCheckoutEmbed({ planId, userId }: { planId: string; userId: string }) {
  const [error, setError] = useState<string | null>(null);
  const returnUrl =
    typeof window !== "undefined" ? `${window.location.origin}/pricing?checkout=complete` : undefined;

  return (
    <WhopElements elements={elements}>
      <Checkout
        plan={planId}
        metadata={{ userId }}
        returnUrl={returnUrl}
        appearance={{ theme: { appearance: "dark", accentColor: "green" } }}
      >
        <CheckoutElement onError={(e) => setError(e.message)} />
      </Checkout>
      {error && <p className="px-4 pb-3 text-center text-xs text-down">{error}</p>}
    </WhopElements>
  );
}
