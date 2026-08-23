"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ArrowLeft, ChevronRight, AtSign, Zap, LogOut, LifeBuoy, RotateCcw } from "lucide-react";
import { GlowButton } from "@/components/landing/primitives";
import { useUsername } from "@/lib/hooks/useSettings";
import { useSubscription } from "@/lib/hooks/useSubscription";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { username, hydrated, setUsername } = useUsername();
  const { subscribed } = useSubscription();
  const [draft, setDraft] = useState("");
  const [cleared, setCleared] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function resetAccountData() {
    if (!confirm("Reset account data? This clears positions, follows and history.")) return;
    setResetting(true);
    try {
      await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      setCleared(true);
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" aria-label="Back to dashboard" className="ghost-button h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
      </div>

      {!subscribed && (
        <GlowButton href="/pricing" className="w-full px-6 py-3.5 text-base">
          Unlock Everything for $1 <Zap className="h-4 w-4 fill-current" />
        </GlowButton>
      )}

      <div className="glass-panel rounded-3xl p-5">
        <label htmlFor="username" className="text-sm font-semibold text-foreground">
          Username
        </label>
        <div className="mt-2 flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-brand/25 bg-brand/[0.05] px-3.5 py-2.5 focus-within:border-brand/50">
            <AtSign className="h-4 w-4 text-brand" />
            <input
              id="username"
              defaultValue={username}
              onChange={(e) => setDraft(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="username"
            />
          </div>
          <button
            onClick={() => setUsername(draft || username)}
            disabled={!hydrated}
            className="ghost-button px-5 text-sm disabled:opacity-50"
          >
            Save
          </button>
        </div>
        {session?.user?.email && (
          <p className="mt-3 text-xs text-muted-foreground">Signed in as {session.user.email}</p>
        )}
      </div>

      <div className="glass-panel divide-y divide-border rounded-3xl p-1.5">
        <Link
          href="/pricing"
          className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-colors duration-200 hover:bg-brand/[0.08]"
        >
          <span className="min-w-0 flex-1">
            <span className="font-medium text-foreground">
              {subscribed ? "Manage subscription" : "Unlock all features"}
            </span>
            {!subscribed && (
              <span className="ml-2 inline-flex gap-1.5 align-middle text-[11px] font-semibold">
                <span className="rounded-md border border-brand/40 bg-brand/[0.12] px-1.5 py-0.5 text-brand">
                  -97% off
                </span>
                <span className="rounded-md border border-proof/40 bg-proof/[0.12] px-1.5 py-0.5 text-proof">
                  $1 first week
                </span>
              </span>
            )}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          href="/help"
          className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-colors duration-200 hover:bg-brand/[0.08]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand/30 bg-brand/10">
            <LifeBuoy className="h-4 w-4 text-brand" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-foreground">Help &amp; Support</span>
            <span className="block text-xs text-muted-foreground">Guides and contact</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <button
          onClick={resetAccountData}
          disabled={resetting}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors duration-200 hover:bg-foreground/5 disabled:opacity-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-down/30 bg-down/10">
            <RotateCcw className="h-4 w-4 text-down" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-foreground">
              {resetting ? "Resetting…" : "Reset account data"}
            </span>
            <span className="block text-xs text-muted-foreground">
              Clears positions, follows and history. Your login stays.
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors duration-200 hover:bg-foreground/5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-foreground/5">
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-foreground">Log out</span>
            <span className="block text-xs text-muted-foreground">End this session</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {cleared && <p className="text-xs text-up">Cleared — reload the page to see it reset.</p>}
    </div>
  );
}
