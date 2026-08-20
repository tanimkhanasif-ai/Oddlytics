"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { TrendingUp } from "lucide-react";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#faq", label: "FAQs" },
  { href: "/pricing", label: "Pricing" },
];

export default function Nav() {
  const { status } = useSession();
  const pathname = usePathname() || "/";

  return (
    <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-brand/50 bg-brand/10">
            <TrendingUp className="h-5 w-5 text-brand-bright" strokeWidth={2.5} />
          </span>
          <span className="text-xl font-semibold tracking-tight text-white">Oddlytics</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-300 sm:flex">
          {LINKS.map((link) => {
            const active = link.href === "/pricing" && pathname === "/pricing";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative pb-1 transition hover:text-white ${
                  active ? "text-brand-bright" : ""
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute inset-x-0 -bottom-[1px] h-0.5 rounded-full bg-brand-bright" />
                )}
              </Link>
            );
          })}
        </nav>
        {status === "authenticated" ? (
          <Link
            href="/dashboard"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-dark"
          >
            Open Dashboard
          </Link>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm text-gray-300 hover:text-white sm:inline">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-dark"
            >
              Start winning smarter
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
