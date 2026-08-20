import Link from "next/link";
import {
  Search,
  ShieldCheck,
  Star,
  Calendar,
  User,
  BarChart3,
  Bot,
  Lock,
  type LucideIcon,
} from "lucide-react";

interface PanelColumn {
  icon: LucideIcon;
  title: string;
  body: string;
  cta: string;
  href: string;
}

interface Panel {
  tone: "green" | "brightGreen" | "purple";
  title: string;
  subtitle: string;
  columns: [PanelColumn, PanelColumn];
}

const PANELS: Panel[] = [
  {
    tone: "green",
    title: "Scan any market. Get your edge instantly.",
    subtitle: "Upload a screenshot from any prediction market and let AI do the heavy lifting.",
    columns: [
      {
        icon: Search,
        title: "Scan any bet, anywhere",
        body: "Works with Polymarket, Kalshi, and more. Our AI reads the market, understands what matters, and gives you clear insights you can act on.",
        cta: "Try the Analyzer",
        href: "/analyzer",
      },
      {
        icon: ShieldCheck,
        title: "Confidence scores, risks & exit plans",
        body: "See a confidence level, key risks, and take-profit/stop-loss rules so you know exactly when to enter or walk away.",
        cta: "Try the Analyzer",
        href: "/analyzer",
      },
    ],
  },
  {
    tone: "brightGreen",
    title: "Daily top picks, curated by AI.",
    subtitle:
      "Our AI scans markets, news, and live data to surface curated opportunities — so you can skip the noise.",
    columns: [
      {
        icon: Star,
        title: "Curated picks, updated daily",
        body: "A refreshed feed of picks with full reasoning behind each one. No noise — just analysis you can act on.",
        cta: "See Today's Picks",
        href: "/handpicked-bets",
      },
      {
        icon: Calendar,
        title: "Know what to bet, and when",
        body: "Each pick includes entry price, target price, and reasoning — giving you the clarity to act fast and confidently.",
        cta: "See Today's Picks",
        href: "/handpicked-bets",
      },
    ],
  },
  {
    tone: "purple",
    title: "Get AI-powered coaching when you need it.",
    subtitle: "Ask anything about markets, strategies, or your positions. Get answers backed by live data.",
    columns: [
      {
        icon: User,
        title: "Personal guidance, on demand",
        body: "Whether it's a term you don't know or a strategy you want explained, the AI Coach walks you through it step-by-step.",
        cta: "Try AI Coach",
        href: "/coach",
      },
      {
        icon: BarChart3,
        title: "Built on live market data",
        body: "The Coach can see your current analysis or paper-trading position and reference it directly in its answers.",
        cta: "See How It Works",
        href: "/coach",
      },
    ],
  },
  {
    tone: "green",
    title: "Automate smarter. Let Copy Trading handle it.",
    subtitle: "Follow a real top Polymarket trader and let their strategy run automatically — with virtual money.",
    columns: [
      {
        icon: Bot,
        title: "Smart automation",
        body: "Pick a real top Polymarket trader (ranked by real, live P&L), set your virtual budget, and Copy Trading mirrors their new trades automatically.",
        cta: "Try Copy Trading",
        href: "/copy-trading",
      },
      {
        icon: Lock,
        title: "Full control. Zero real-money risk.",
        body: "Copy Trading only ever moves your virtual Paper Trading balance — never a real wallet or real funds. Follow, adjust, or unfollow anytime.",
        cta: "See How It Works",
        href: "/copy-trading",
      },
    ],
  },
];

const TONE_STYLES: Record<Panel["tone"], string> = {
  green: "border-brand/25 bg-gradient-to-br from-brand-deep/60 to-black/40",
  brightGreen: "border-brand-bright/30 bg-gradient-to-br from-brand/20 to-brand-deep/50",
  purple: "border-purple-500/25 bg-gradient-to-br from-purple-950/50 to-black/40",
};

const ICON_TONE_STYLES: Record<Panel["tone"], string> = {
  green: "border-brand/40 bg-brand/10 text-brand-bright",
  brightGreen: "border-brand-bright/40 bg-brand/15 text-brand-bright",
  purple: "border-purple-400/40 bg-purple-500/10 text-purple-300",
};

const CTA_TONE_STYLES: Record<Panel["tone"], string> = {
  green: "border-brand/40 text-brand-bright hover:bg-brand/10",
  brightGreen: "border-brand-bright/40 text-brand-bright hover:bg-brand/10",
  purple: "border-purple-400/40 text-purple-300 hover:bg-purple-500/10",
};

export default function FeaturePanels() {
  return (
    <div className="space-y-5">
      {PANELS.map((panel) => (
        <div
          key={panel.title}
          className={`rounded-2xl border p-6 sm:p-8 ${TONE_STYLES[panel.tone]}`}
        >
          <h3 className="text-xl font-bold text-white sm:text-2xl">{panel.title}</h3>
          <p className="mt-1.5 max-w-2xl text-sm text-gray-400">{panel.subtitle}</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {panel.columns.map((col) => {
              const Icon = col.icon;
              return (
                <div key={col.title}>
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-xl border ${ICON_TONE_STYLES[panel.tone]}`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <h4 className="mt-3 font-semibold text-white">{col.title}</h4>
                  <p className="mt-1 text-sm text-gray-400">{col.body}</p>
                  <Link
                    href={col.href}
                    className={`mt-3 inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${CTA_TONE_STYLES[panel.tone]}`}
                  >
                    {col.cta} →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
