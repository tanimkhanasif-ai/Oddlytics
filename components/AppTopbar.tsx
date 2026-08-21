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
        <div className="flex items-center gap-2 text-white">
          {Icon && <Icon className="h-5 w-5 text-brand-bright" />}
          <h1 className="text-lg font-semibold">{title}</h1>
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
            className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-bright hover:bg-brand/20"
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
