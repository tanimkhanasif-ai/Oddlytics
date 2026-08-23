"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Crown, LogOut, Settings as SettingsIcon, LifeBuoy } from "lucide-react";

export const accountOptions = [
  { title: "Upgrade", icon: Crown, note: "Unlock every Oddlytics feature", to: "/pricing" },
  {
    title: "Settings",
    icon: SettingsIcon,
    note: "Account, profile and preferences",
    to: "/settings",
  },
  { title: "Help & Support", icon: LifeBuoy, note: "Guides and contact", to: "/help" },
] as const;

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AccountMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "trader";

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative transition-transform duration-200 hover:scale-105"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/40 bg-brand/15 text-sm font-bold text-brand">
          {initialsFor(displayName)}
        </span>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-brand" />
      </button>

      {open && (
        <div className="glass-panel absolute right-0 z-50 mt-2 w-60 rounded-2xl p-1.5 text-foreground">
          <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
            {session?.user?.email ?? "Your account"}
          </p>
          {accountOptions.map((o) => (
            <Link
              key={o.title}
              href={o.to}
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-brand/10"
            >
              <o.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{o.title}</span>
                <span className="block text-xs text-muted-foreground">{o.note}</span>
              </span>
            </Link>
          ))}
          <div className="my-1 h-px bg-border" />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-foreground/5"
          >
            <LogOut className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              <span className="block text-sm font-medium">Log out</span>
              <span className="block text-xs text-muted-foreground">End this session</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
