"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
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
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        {session?.user?.email && (
          <p className="mt-1 text-sm text-gray-400">Signed in as {session.user.email}</p>
        )}
      </div>

      {!subscribed && (
        <Link
          href="/pricing"
          className="block rounded-lg bg-white px-4 py-3 text-center text-sm font-medium text-black hover:bg-gray-200"
        >
          Unlock all features
        </Link>
      )}

      <div>
        <label className="text-xs font-medium text-gray-400">Display name</label>
        <div className="mt-1 flex gap-2">
          <input
            defaultValue={username}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="@yourname"
            className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-600"
          />
          <button
            onClick={() => setUsername(draft || username)}
            disabled={!hydrated}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/20 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-400">Subscription</p>
        <p className="mt-1 text-sm text-gray-300">
          {subscribed ? "All-Access (test mode — no real charge)" : "Free"}
        </p>
      </div>

      <div className="border-t border-white/10 pt-6">
        <p className="text-xs font-medium text-gray-400">Account data</p>
        <p className="mt-1 text-xs text-gray-500">
          Clears Paper Trading, subscription status, tracked wallets, Copy Trading follows, and
          analysis history for your account. Your login stays intact.
        </p>
        <button
          onClick={resetAccountData}
          disabled={resetting}
          className="mt-2 rounded-lg bg-no/10 px-4 py-2 text-sm font-medium text-no hover:bg-no/20 disabled:opacity-50"
        >
          {resetting ? "Resetting…" : "Reset account data"}
        </button>
        {cleared && (
          <p className="mt-2 text-xs text-yes">Cleared — reload the page to see it reset.</p>
        )}
      </div>

      <div className="border-t border-white/10 pt-6">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-gray-400 hover:text-white"
        >
          Log out
        </button>
      </div>

      <div className="border-t border-white/10 pt-6">
        <p className="text-xs font-medium text-gray-400">Support</p>
        <p className="mt-1 text-sm text-gray-500">
          Support isn't wired up yet — this is a placeholder for a real contact flow.
        </p>
      </div>
    </div>
  );
}
