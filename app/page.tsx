import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Faqs, Features, Hero, Pricing, ProfitCalculator, Steps } from "@/components/landing/sections";
import { Footer, Nav, OfferBar, WinToast } from "@/components/landing/chrome";

export const metadata: Metadata = {
  title: "Oddlytics — The AI Predictor for Prediction Markets",
  description:
    "Oddlytics is your all in one AI tool for prediction markets and it analyzes and gives you the perfect bet for prediction markets.",
  openGraph: {
    title: "Oddlytics — The AI Predictor for Prediction Markets",
    description:
      "Screenshot. Predict. Win. AI-powered picks, confidence scores and automation for Polymarket, Kalshi and more.",
    type: "website",
    siteName: "Oddlytics",
  },
  twitter: { card: "summary_large_image" },
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <div className="aurora min-h-screen overflow-x-clip font-sans [zoom:0.9]">
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
