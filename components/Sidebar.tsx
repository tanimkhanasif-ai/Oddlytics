"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutGrid,
  Sparkles,
  MessageCircle,
  Monitor,
  Wallet,
  Users,
  Bookmark,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  TrendingUp,
} from "lucide-react";
import ModeBadge from "@/components/ModeBadge";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/analyzer", label: "AI Predictor", icon: Sparkles },
  { href: "/coach", label: "AI Coach", icon: MessageCircle },
  { href: "/paper-trading", label: "Virtual Trading", icon: Monitor },
  { href: "/handpicked-bets", label: "Handpicked", icon: Bookmark },
  { href: "/wallet-tracker", label: "Wallet Tracker", icon: Wallet },
  { href: "/copy-trading", label: "Copy Trading", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname() || "";
  const { data: session } = useSession();

  return (
    <aside className="flex w-16 shrink-0 flex-col gap-1 border-r border-white/10 bg-black/20 py-4 sm:w-56 sm:px-3">
      <Link href="/" className="mb-4 flex items-center justify-center gap-2 px-2 text-white sm:justify-start">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-brand/40 bg-brand/10 text-brand-bright">
          <TrendingUp className="h-4.5 w-4.5" />
        </span>
        <span className="hidden text-sm font-semibold sm:inline">Oddlytics</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center justify-center gap-3 rounded-lg px-2.5 py-2 text-sm sm:justify-start ${
                active
                  ? "bg-brand font-semibold text-black shadow-[0_6px_16px_-6px_rgba(34,197,94,0.6)]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-1 border-t border-white/10 pt-2">
        <Link
          href="/settings"
          title="Settings"
          className={`flex items-center justify-center gap-3 rounded-lg px-2.5 py-2 text-sm sm:justify-start ${
            pathname.startsWith("/settings")
              ? "bg-brand font-semibold text-black"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <SettingsIcon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
          <span className="hidden sm:inline">Settings</span>
        </Link>
        <Link
          href="/help"
          title="Help & Support"
          className={`flex items-center justify-center gap-3 rounded-lg px-2.5 py-2 text-sm sm:justify-start ${
            pathname.startsWith("/help")
              ? "bg-brand font-semibold text-black"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <HelpCircle className="h-5 w-5 shrink-0" strokeWidth={1.8} />
          <span className="hidden sm:inline">Help & Support</span>
        </Link>
        <div className="hidden justify-center px-1 pt-1 sm:flex">
          <ModeBadge />
        </div>
        {session?.user?.email && (
          <p
            className="hidden truncate px-2 pt-2 text-xs text-gray-500 sm:block"
            title={session.user.email}
          >
            {session.user.email}
          </p>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Log out"
          className="flex items-center justify-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-gray-400 hover:bg-white/5 hover:text-white sm:justify-start"
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.8} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </aside>
  );
}
