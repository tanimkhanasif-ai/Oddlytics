"use client";

import { useState } from "react";
import Link from "next/link";
import { useUsername } from "@/lib/hooks/useSettings";
import { useSubscription } from "@/lib/hooks/useSubscription";

const ALL_LOCAL_KEYS = [
  "oddlytics_paper_trading_v1",
  "oddlytics_subscribed_v1",
  "oddlytics_analysis_history_v1",
  "oddlytics_tracked_wallets_v1",
  "oddlytics_copy_trading_v1",
  "oddlytics_copy_trading_feed_v1",
  "oddlytics_username_v1",
  "oddlytics_offer_deadline_v1",
];

export default function SettingsPage() {
  const { username, hydrated, setUsername } = useUsername();
  const { subscribed } = useSubscription();
  const [draft, setDraft] = useState("");
  const [cleared, setCleared] = useState(false);

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          There's no account system yet — everything here is stored locally in this browser.
        </p>
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
        <p className="text-xs font-medium text-gray-400">Demo data</p>
        <p className="mt-1 text-xs text-gray-500">
          Clears Paper Trading, subscription status, tracked wallets, Copy Trading follows, and
          analysis history from this browser only.
        </p>
        <button
          onClick={() => {
            ALL_LOCAL_KEYS.forEach((k) => window.localStorage.removeItem(k));
            setCleared(true);
          }}
          className="mt-2 rounded-lg bg-no/10 px-4 py-2 text-sm font-medium text-no hover:bg-no/20"
        >
          Reset all local demo data
        </button>
        {cleared && (
          <p className="mt-2 text-xs text-yes">Cleared — reload the page to see it reset.</p>
        )}
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
