"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import type { ComponentType } from "react";
import { useSubscription } from "@/lib/hooks/useSubscription";
import InitialsAvatar from "@/components/InitialsAvatar";

interface AppTopbarProps {
  /** Page title shown with an icon on the left. Omit on Dashboard to show the welcome message instead. */
  title?: string;
  icon?: ComponentType<{ className?: string }>;
}

export default function AppTopbar({ title, icon: Icon }: AppTopbarProps) {
  const { data: session } = useSession();
  const { subscribed, hydrated } = useSubscription();

  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "trader";

  return (
    <header className="-mx-6 -mt-6 mb-2 flex items-center justify-between border-b border-white/10 px-6 py-4 sm:-mx-10 sm:mb-0 sm:px-10">
      {title ? (
        <div className="flex items-center gap-3 text-white">
          {Icon && (
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-black shadow-[0_6px_16px_-6px_rgba(34,197,94,0.6)]">
              <Icon className="h-4.5 w-4.5" />
            </span>
          )}
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        </div>
      ) : (
        <p className="text-sm text-gray-300">
          Welcome back, <span className="font-medium text-brand-bright">{displayName}</span> 👋
        </p>
      )}
      <div className="flex items-center gap-3">
        {hydrated && !subscribed && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-black shadow-[0_6px_16px_-6px_rgba(34,197,94,0.7)] transition hover:brightness-110"
          >
            Upgrade!
            <Zap className="h-3.5 w-3.5" fill="currentColor" />
          </Link>
        )}
        <InitialsAvatar name={displayName} online />
      </div>
    </header>
  );
}
