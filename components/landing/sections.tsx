"use client";

import {
  UploadCloud,
  Brain,
  Crosshair,
  Search,
  ShieldCheck,
  Star,
  CalendarDays,
  Bot,
  Lock,
  Check,
  Flame,
  MessageCircleQuestion,
  Trophy,
  Globe,
  Zap,
  GraduationCap,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AvatarRow, Arrow, DropTime, GlowButton, Stars, VerifiedBadge } from "./primitives";
import { useCountdown, usePrimaryCtaHref } from "./chrome";

const WON_BASE = 3261863;
const WON_KEY = "oddlytics-personal-won";

/** Per-visitor counter that ticks up while the page is open and persists locally. */
function usePersonalWonCounter() {
  const [value, setValue] = useState(WON_BASE);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(WON_KEY));
    let current = Number.isFinite(stored) && stored > WON_BASE ? stored : WON_BASE;
    setValue(current);

    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      current += Math.floor(Math.random() * 7) + 1;
      setValue(current);
      window.localStorage.setItem(WON_KEY, String(current));
      timeout = setTimeout(tick, 1000 + Math.random() * 2000);
    };
    timeout = setTimeout(tick, 1200);
    return () => clearTimeout(timeout);
  }, []);

  return value.toLocaleString("en-US");
}

export function Hero() {
  const won = usePersonalWonCounter();
  const ctaHref = usePrimaryCtaHref();
  return (
    <section className="relative px-6 pb-24 pt-14 text-center">
      <div className="mx-auto max-w-5xl">
        <div className="reveal flex flex-wrap items-center justify-center gap-4 text-lg">
          <AvatarRow count={3} />
          <span className="font-medium text-proof tabular-nums">
            $<DropTime value={won} />+
          </span>
          <span className="font-medium text-foreground">won by people like you</span>
          <VerifiedBadge label="" />
        </div>

        <h1 className="reveal mt-10 text-5xl font-extrabold leading-[1.02] tracking-tight text-foreground md:text-7xl lg:text-[5.5rem]">
          The{" "}
          <span className="italic text-brand underline decoration-brand decoration-[6px] underline-offset-[14px]">
            #1 AI Predictor
          </span>{" "}
          <span className="font-normal">To Beat</span> Prediction Markets
        </h1>

        <p className="reveal mx-auto mt-10 max-w-2xl text-lg text-foreground/80 md:text-xl">
          Oddlytics is your all in one platform for making money on prediction markets with the
          power of AI
        </p>

        <div className="reveal mt-10 flex justify-center">
          <GlowButton href={ctaHref} variant="light" size="lg" seesaw className="px-16 py-6">
            Start winning smarter <Arrow />
          </GlowButton>
        </div>

        <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-4 text-lg">
          <Stars />
          <span className="font-semibold text-foreground">4.9/5</span>
          <span className="text-muted-foreground">|</span>
          <VerifiedBadge />
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          *Works with Kalshi, Polymarket and more. Oddlytics never touches you money or wallet.*
        </p>
      </div>
    </section>
  );
}

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: UploadCloud, title: "Upload Screenshot", body: "Drop a screenshot of any market." },
  { icon: Brain, title: "AI Predicts", body: "Our AI scans news & data for your edge." },
  { icon: Crosshair, title: "Get Your Pick", body: "Get a clear pick. Decide your move." },
];

export function Steps() {
  const ctaHref = usePrimaryCtaHref();
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
          Screenshot. <span className="text-brand">Predict.</span> Win.
        </h2>
        <p className="mt-4 text-lg text-foreground/80">
          In just three simple steps, start making <span className="text-brand">smarter bets</span>.
        </p>

        <div className="mt-12 space-y-6">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="sheet-card reveal flex items-center gap-6 rounded-3xl p-6 text-left shadow-[var(--glow-soft)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[var(--glow-brand)]"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[oklch(0.92_0.09_145)]">
                <step.icon className="h-10 w-10" strokeWidth={1.8} />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-current/20" />
                  <span className="rounded-full bg-[color:var(--on-brand)] px-3 py-1 text-xs font-semibold text-[color:var(--sheet-top)]">
                    Step {i + 1}
                  </span>
                  <span className="h-px w-8 bg-current/20" />
                </div>
                <h3 className="mt-3 text-2xl font-bold">{step.title}</h3>
                <p className="mt-1 text-base opacity-80">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <GlowButton href={ctaHref} variant="light" size="lg" className="px-14">
            Start winning smarter <Arrow />
          </GlowButton>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <AvatarRow count={5} size={38} />
          <p className="text-lg text-foreground/90">
            Trusted by <span className="font-semibold text-brand">28k+</span> Traders
          </p>
        </div>
      </div>
    </section>
  );
}

type Panel = {
  title: string;
  accent: string;
  trail?: string;
  sub: string;
  items: { icon: LucideIcon; heading: string; body: string; cta: string; href: string }[];
};

const PANELS: Panel[] = [
  {
    title: "Scan any market. Get your ",
    accent: "edge instantly.",
    sub: "Upload a screenshot from any prediction market and let AI do the heavy lifting.",
    items: [
      {
        icon: Search,
        heading: "Scan any bet, anywhere",
        body: "Works with Polymarket, Kalshi, and more. Our AI reads the market, understands what matters, and gives you clear insights you can act on.",
        cta: "Try the Analyzer",
        href: "/analyzer",
      },
      {
        icon: ShieldCheck,
        heading: "Confidence scores, risks & exit plans",
        body: "See confidence levels, potential risks, and smart exit strategies so you always know exactly when to enter or when to walk away.",
        cta: "Try the Analyzer",
        href: "/analyzer",
      },
    ],
  },
  {
    title: "Daily top picks, ",
    accent: "curated by AI.",
    sub: "Our AI scans the entire web to surface the highest-quality opportunities—so you can skip the noise and bet with confidence.",
    items: [
      {
        icon: Star,
        heading: "Curated picks, updated daily",
        body: "We analyze hundreds of markets, news, and live data to bring you only the highest-probability picks. No noise. Just opportunities.",
        cta: "See Today's Picks",
        href: "/handpicked-bets",
      },
      {
        icon: CalendarDays,
        heading: "Know what to bet, and when",
        body: "Each pick includes entry timing, target price, and reasoning—giving you the clarity to act fast and confidently.",
        cta: "See Today's Picks",
        href: "/handpicked-bets",
      },
    ],
  },
  {
    title: "Automate smarter. ",
    accent: "Let Copy Trading handle it.",
    sub: "Follow a real top Polymarket trader and let their strategy run automatically — with virtual money.",
    items: [
      {
        icon: Bot,
        heading: "Smart automation",
        body: "Pick a real top Polymarket trader (ranked by real, live P&L), set your virtual budget, and Copy Trading mirrors their new trades automatically.",
        cta: "Try Copy Trading",
        href: "/copy-trading",
      },
      {
        icon: Lock,
        heading: "Full control. Zero real-money risk.",
        body: "Copy Trading only ever moves your virtual Paper Trading balance — never a real wallet or real funds. Follow, adjust, or unfollow anytime.",
        cta: "See How It Works",
        href: "/copy-trading",
      },
    ],
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-6 py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        {PANELS.map((panel) => (
          <article
            key={panel.accent}
            className="reveal relative overflow-hidden rounded-3xl border border-brand/35 bg-[linear-gradient(140deg,oklch(0.16_0.06_150/0.7),oklch(0.08_0.02_155/0.9))] p-8 shadow-[var(--glow-soft)] md:p-10"
          >
            <h3 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {panel.title}
              <span className="text-brand">{panel.accent}</span>
              {panel.trail ?? ""}
            </h3>
            <p className="mt-2 max-w-3xl text-sm text-foreground/70 md:text-base">{panel.sub}</p>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {panel.items.map((item) => (
                <div key={item.heading} className="flex gap-5">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-brand/45 bg-brand/10 text-brand shadow-[var(--glow-soft)]">
                    <item.icon className="h-8 w-8" strokeWidth={1.7} />
                  </span>
                  <div>
                    <h4 className="text-lg font-bold text-foreground">{item.heading}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{item.body}</p>
                    <GlowButton
                      href={item.href}
                      size="sm"
                      className="mt-4 border border-brand/50 bg-none font-semibold text-brand shadow-none hover:shadow-[var(--glow-brand)]"
                    >
                      {item.cta} <Arrow />
                    </GlowButton>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const BENEFITS = [
  ["Unlimited AI analysis", "on any market"],
  ["Smart copy trading", "to follow top traders automatically"],
  ["Daily high-conviction picks", "from our AI"],
  ["Live wallet tracking", "of top-performing traders"],
  ["Paper trading", "to refine your strategy risk-free"],
];

export function Pricing() {
  const time = useCountdown();
  return (
    <section id="pricing" className="relative px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-center">
          <span className="pulse-glow inline-flex items-center gap-2 rounded-full border border-brand/40 bg-card/70 px-5 py-2 text-sm font-medium text-foreground">
            <Flame className="h-4 w-4 text-brand" /> First week $1. Offer ends 11:59pm:{" "}
            <DropTime value={time} />
          </span>
        </div>

        <div className="reveal mt-8 rounded-[28px] border border-brand/50 bg-[linear-gradient(160deg,oklch(0.16_0.06_150/0.75),oklch(0.08_0.02_155/0.92))] p-7 shadow-[0_0_0_1px_oklch(0.75_0.27_145/25%),var(--glow-brand)] ring-1 ring-brand/20 ring-offset-4 ring-offset-background">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-foreground/80">
              Trusted by <span className="font-semibold text-brand">28k+ traders</span>
            </p>
            <span className="rounded-full border border-brand/40 bg-brand/10 px-4 py-1.5 text-sm font-medium text-foreground">
              One win pays for your whole month
            </span>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/40 bg-brand/10 text-brand shadow-[var(--glow-soft)]">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M15 7h6v6" />
              </svg>
            </span>
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight text-foreground">Full Access</h3>
              <p className="text-sm text-foreground/70">
                Complete access to everything Oddlytics has to offer.
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-end gap-2.5">
            <span className="text-2xl font-bold text-foreground">Just</span>
            <span className="text-2xl font-bold text-muted-foreground line-through">$29</span>
            <span className="text-3xl font-extrabold text-foreground">$1</span>
            <span className="mb-1 rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-semibold text-brand">
              -97%
            </span>
          </div>

          <GlowButton href="/pricing" className="mt-5 w-full py-4 text-lg">
            Get Full Access for $1 <Arrow />
          </GlowButton>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Stars />
            <span className="font-semibold text-foreground">4.9/5</span>
            <span className="text-muted-foreground">|</span>
            <VerifiedBadge />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-8 text-sm text-foreground/85">
            {["Instant access", "Cancel anytime", "Secure checkout"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-brand" /> {t}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-panel reveal mt-6 space-y-4 rounded-3xl p-8">
          {BENEFITS.map(([bold, rest]) => (
            <p key={bold} className="flex items-start gap-3 text-lg text-foreground/85">
              <Check className="mt-1 h-5 w-5 shrink-0 text-brand" />
              <span>
                <span className="font-bold text-foreground">{bold}</span> {rest}
              </span>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS: { icon: LucideIcon; q: string; a: string }[] = [
  {
    icon: MessageCircleQuestion,
    q: "Does Oddlytics really work?",
    a: "Yes. Our AI analyzes millions of data points, news, sentiment, and market signals to surface high-edge opportunities. While no tool can guarantee wins, Oddlytics gives you a measurable advantage.",
  },
  {
    icon: Trophy,
    q: "Why is Oddlytics better than doing my own research?",
    a: "Researching every market takes hours—our AI does it in seconds. You get curated picks, confidence scores, live updates, and risk insights in one place, so you can bet smarter, not harder.",
  },
  {
    icon: Globe,
    q: "Which prediction markets and platforms are supported?",
    a: "We currently support Polymarket, Kalshi, and more coming soon.",
  },
  {
    icon: Crosshair,
    q: "How accurate and reliable are the predictions?",
    a: "Our historical accuracy on top picks has consistently outperformed the market. Every pick comes with a confidence score and reasoning so you can bet with clarity.",
  },
  {
    icon: Zap,
    q: "How quickly do I get picks and updates?",
    a: "Picks are updated multiple times daily, with real-time alerts for high-value opportunities as markets move.",
  },
  {
    icon: GraduationCap,
    q: "Do I need experience with prediction markets?",
    a: "Not at all. Oddlytics is built for everyone—from beginners to pros. We guide you step-by-step.",
  },
];

export function Faqs() {
  const [open, setOpen] = useState<number[]>([0]);
  const toggle = (i: number) =>
    setOpen((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  return (
    <section id="faqs" className="relative px-6 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
          Got questions?
          <br />
          <span className="text-brand">We&apos;ve got answers.</span>
        </h2>
        <p className="mt-4 text-lg text-foreground/75">
          Everything you need to know about Oddlytics and prediction markets.
        </p>

        <div className="mt-10 space-y-4 text-left">
          {FAQS.map((faq, i) => {
            const isOpen = open.includes(i);
            return (
              <div
                key={faq.q}
                className="glass-panel reveal overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-[var(--glow-brand)]"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-5 p-6 text-left"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-brand/40 bg-brand/10 text-brand">
                    <faq.icon className="h-7 w-7" strokeWidth={1.7} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-lg font-bold text-foreground">{faq.q}</span>
                    <span
                      className={cn(
                        "grid transition-all duration-500",
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <span className="overflow-hidden">
                        <span className="mt-2 block text-sm leading-relaxed text-foreground/70">
                          {faq.a}
                        </span>
                      </span>
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "mt-1 h-6 w-6 shrink-0 text-brand transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  onChange,
  max,
  prefix = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
  prefix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-medium text-foreground/85">
        <span>{label}</span>
        <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 font-semibold text-brand">
          {prefix}
          {value}
          {value >= max ? "+" : ""}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-brand/20 accent-[color:var(--brand)]"
      />
    </div>
  );
}

export function ProfitCalculator() {
  const [profit, setProfit] = useState(120);
  const [picks, setPicks] = useState(30);
  const total = (profit * picks).toLocaleString("en-US");

  return (
    <section className="relative px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          See your <span className="text-brand">potential.</span>
          <br />
          Month after month.
        </h2>

        <div className="reveal mt-10 space-y-7 rounded-[28px] border border-brand/50 bg-[linear-gradient(160deg,oklch(0.16_0.06_150/0.75),oklch(0.08_0.02_155/0.92))] p-7 text-left shadow-[0_0_0_1px_oklch(0.75_0.27_145/25%),var(--glow-brand)]">
          <Slider
            label="Average profit per winning bet"
            value={profit}
            onChange={setProfit}
            max={1000}
            prefix="$"
          />
          <Slider label="AI winning picks per month" value={picks} onChange={setPicks} max={1000} />

          <div className="rounded-2xl border border-brand/40 bg-brand/10 p-6 text-center shadow-[var(--glow-soft)]">
            <p className="text-sm font-medium text-foreground/75">Your estimated monthly profit</p>
            <p className="mt-2 text-4xl font-extrabold text-brand md:text-5xl">
              $<DropTime value={total} />
            </p>
          </div>

          <GlowButton href="/pricing" className="w-full py-4 text-lg">
            Calculate my profit now <Arrow />
          </GlowButton>
        </div>
      </div>
    </section>
  );
}
