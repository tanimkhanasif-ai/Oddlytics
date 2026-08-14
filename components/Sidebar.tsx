"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ModeBadge from "@/components/ModeBadge";
import type { SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

const HomeIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  </Icon>
);
const WandIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m15 4 1.5 3 3 1.5-3 1.5L15 13l-1.5-3-3-1.5 3-1.5L15 4Z" />
    <path d="m5 21 9-9" />
  </Icon>
);
const ChatIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M21 12a8 8 0 1 1-3.3-6.5" />
    <path d="M21 3v6h-6" />
  </Icon>
);
const ChartIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 20V10M12 20V4M20 20v-7" />
  </Icon>
);
const PeopleIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="8" r="2.5" />
    <path d="M17 12c2.3 0 4.5 1.9 4.9 4.5" />
  </Icon>
);
const BoltIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </Icon>
);
const DocIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M14 3v4h4" />
    <path d="M9 13h6M9 17h6" />
  </Icon>
);
const GearIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </Icon>
);

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/analyzer", label: "AI Analyzer", icon: WandIcon },
  { href: "/coach", label: "AI Coach", icon: ChatIcon },
  { href: "/paper-trading", label: "Paper Trading", icon: ChartIcon },
  { href: "/wallet-tracker", label: "Wallet Tracker", icon: PeopleIcon },
  { href: "/copy-trading", label: "Copy Trading", icon: BoltIcon },
  { href: "/handpicked-bets", label: "Handpicked Bets", icon: DocIcon },
];

export default function Sidebar() {
  const pathname = usePathname() || "";

  return (
    <aside className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-white/10 bg-black/20 py-4 sm:w-56 sm:items-stretch sm:px-3">
      <Link href="/" className="mb-4 flex items-center gap-2 px-2 text-white">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-sm font-bold text-black">
          O
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
                active ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
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
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <GearIcon className="h-5 w-5 shrink-0" />
          <span className="hidden sm:inline">Settings</span>
        </Link>
        <Link
          href="/pricing"
          className="mt-1 rounded-lg bg-white px-2.5 py-2 text-center text-sm font-medium text-black hover:bg-gray-200"
        >
          Upgrade
        </Link>
        <div className="hidden justify-center px-1 pt-1 sm:flex">
          <ModeBadge />
        </div>
      </div>
    </aside>
  );
}
