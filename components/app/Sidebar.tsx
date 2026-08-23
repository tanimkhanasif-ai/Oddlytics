"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  TrendingUp,
  Sparkles,
  MonitorPlay,
  BookmarkCheck,
  Wallet,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAIN = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutGrid },
  { title: "AI Predictor", url: "/analyzer", icon: Sparkles },
  { title: "Virtual Trading", url: "/paper-trading", icon: MonitorPlay },
  { title: "Handpicked", url: "/handpicked-bets", icon: BookmarkCheck },
  { title: "Wallet Tracker", url: "/wallet-tracker", icon: Wallet },
  { title: "Copy Trading", url: "/copy-trading", icon: Users },
] as const;

const SECONDARY = [{ title: "Settings", url: "/settings", icon: Settings }] as const;

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname() || "";

  const item = (entry: { title: string; url: string; icon: LucideIcon }) => {
    const active = pathname === entry.url || pathname.startsWith(`${entry.url}/`);
    const Icon = entry.icon;
    return (
      <Link
        key={entry.url}
        href={entry.url}
        title={entry.title}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
          active
            ? "text-brand"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
        )}
      >
        {active && (
          <>
            <span className="pointer-events-none absolute inset-0 rounded-xl border border-brand/35 bg-brand/10 shadow-[var(--glow-soft)]" />
            <span className="pointer-events-none absolute -left-2 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-brand shadow-[0_0_12px_var(--brand)]" />
          </>
        )}
        <Icon
          className={cn(
            "relative z-10 h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
            active && "drop-shadow-[0_0_8px_var(--brand)]",
          )}
        />
        {!collapsed && <span className="relative z-10 truncate font-medium">{entry.title}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "glass-panel sticky top-4 z-30 hidden h-[calc(100vh-2rem)] shrink-0 flex-col rounded-3xl p-3 transition-[width] duration-300 md:flex",
        collapsed ? "w-[76px]" : "w-[248px]",
      )}
    >
      <Link href="/" className="flex items-center gap-3 px-1 pb-4 pt-1">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand/40 bg-brand/10 shadow-[var(--glow-soft)]">
          <TrendingUp className="h-5 w-5 text-brand" />
        </span>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-foreground">Oddlytics</span>
        )}
      </Link>

      <div className="mb-3 h-px bg-border" />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {MAIN.map(item)}
        <div className="my-3 h-px bg-border" />
        {SECONDARY.map(item)}
      </nav>

      <button
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="ghost-button mt-3 w-full px-3 py-2 text-xs text-muted-foreground"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <>
            <PanelLeftClose className="h-4 w-4" /> Collapse
          </>
        )}
      </button>
    </aside>
  );
}
