import Link from "next/link";
import { BadgeCheck, Trophy } from "lucide-react";
import FaqAccordion from "@/components/FaqAccordion";
import FeaturePanels from "@/components/FeaturePanels";
import PricingTeaserCard from "@/components/PricingTeaserCard";
import ProfitCalculator from "@/components/ProfitCalculator";
import ThreeStepSection from "@/components/ThreeStepSection";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-28">
      <section className="flex flex-col items-center gap-6 pt-6 text-center">
        <div className="flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm text-gray-200">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-6 w-6 rounded-full border-2 border-black bg-gradient-to-br from-brand to-brand-dark"
              />
            ))}
          </div>
          Real Polymarket data. Real-time picks.
          <BadgeCheck className="h-4 w-4 text-blue-400" />
        </div>

        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-6xl">
          The{" "}
          <span className="text-brand-bright italic underline decoration-brand-bright/60 underline-offset-8">
            #1 AI Predictor
          </span>{" "}
          To
          <br />
          Beat Prediction Markets
        </h1>

        <p className="max-w-xl text-gray-400">
          Oddlytics is your all-in-one platform for researching prediction markets with the power
          of AI.
        </p>

        <Link
          href="/signup"
          className="rounded-full bg-gradient-to-r from-white to-gray-100 px-8 py-3.5 text-base font-bold text-brand-dark shadow-glow transition hover:from-gray-100 hover:to-gray-200"
        >
          Start winning smarter →
        </Link>

        <p className="max-w-lg text-xs italic text-gray-500">
          *Works with Kalshi, Polymarket, and more. Oddlytics never touches your money or wallet.*
        </p>
      </section>

      <ThreeStepSection />

      <section id="features">
        <FeaturePanels />
      </section>

      <section className="flex flex-col items-center gap-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-4 py-1.5 text-xs font-semibold text-brand-bright">
          🔥 First week $1 (placeholder pricing)
        </span>
        <PricingTeaserCard />
      </section>

      <section className="space-y-3 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          See your <span className="text-brand-bright">potential.</span> Month after month.
        </h2>
        <p className="text-gray-400">
          Use the calculator below to estimate your <span className="text-brand-bright">monthly edge</span>.
        </p>
        <div className="mx-auto max-w-xl pt-4 text-left">
          <ProfitCalculator />
        </div>
      </section>

      <section id="faq" className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Got questions? <span className="text-brand-bright">We&apos;ve got answers.</span>
          </h2>
          <p className="mt-2 text-gray-400">
            Everything you need to know about Oddlytics and prediction markets.
          </p>
        </div>
        <div className="mx-auto max-w-2xl">
          <FaqAccordion />
        </div>

        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-2xl border border-brand/25 bg-brand/5 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-brand/40 bg-brand/10 text-brand-bright">
              <Trophy className="h-6 w-6" strokeWidth={2.2} />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Ready to start winning?</h3>
              <p className="text-sm text-gray-400">
                Get a clear, structured read on any prediction market in seconds.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 sm:items-end">
            <Link
              href="/signup"
              className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-brand-dark"
            >
              Get my winning edge →
            </Link>
            <span className="text-xs text-gray-500">Cancel anytime · no commitment</span>
          </div>
        </div>
      </section>
    </div>
  );
}
