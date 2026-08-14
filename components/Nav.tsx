"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ModeBadge from "@/components/ModeBadge";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analyzer", label: "AI Analyzer" },
  { href: "/coach", label: "AI Coach" },
  { href: "/paper-trading", label: "Paper Trading" },
  { href: "/handpicked-bets", label: "Handpicked Bets" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          Oddlytics
        </Link>
        <nav className="flex items-center gap-5 text-sm text-gray-400">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname?.startsWith(link.href) ? "text-white" : "hover:text-white"}
            >
              {link.label}
            </Link>
          ))}
          <ModeBadge />
        </nav>
      </div>
    </header>
  );
}
