import type { Metadata } from "next";
import { Faqs, Features, Hero, Pricing, ProfitCalculator, Steps } from "@/components/landing/sections";
import { Footer, Nav, OfferBar, WinToast } from "@/components/landing/chrome";

export const metadata: Metadata = {
  title: "Oddlytics — The #1 AI Predictor for Prediction Markets",
  description:
    "Oddlytics is the all-in-one AI platform for prediction markets. Scan any market, get daily AI picks, confidence scores and automation for Polymarket and Kalshi.",
  openGraph: {
    title: "Oddlytics — The #1 AI Predictor for Prediction Markets",
    description:
      "Screenshot. Predict. Win. AI-powered picks, confidence scores and automation for Polymarket, Kalshi and more.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function HomePage() {
  return (
    <div className="aurora min-h-screen overflow-x-clip font-sans">
      <OfferBar />
      <Nav />
      <main>
        <Hero />
        <Steps />
        <Features />
        <Pricing />
        <ProfitCalculator />
        <Faqs />
      </main>
      <Footer />
      <WinToast />
    </div>
  );
}
