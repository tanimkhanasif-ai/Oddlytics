import Link from "next/link";
import { UploadCloud, Brain, Target } from "lucide-react";

const STEPS = [
  {
    icon: UploadCloud,
    step: "Step 1",
    title: "Upload Screenshot",
    body: "Drop a screenshot of any market.",
  },
  {
    icon: Brain,
    step: "Step 2",
    title: "AI Predicts",
    body: "Our AI scans news & data for your edge.",
  },
  {
    icon: Target,
    step: "Step 3",
    title: "Get Your Pick",
    body: "Get a clear pick. Decide your move.",
  },
];

export default function ThreeStepSection() {
  return (
    <section className="space-y-8 text-center">
      <div>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Screenshot. <span className="text-brand-bright">Predict.</span> Win.
        </h2>
        <p className="mt-3 text-gray-400">
          In just three simple steps, start making <span className="text-brand-bright">smarter bets</span>.
        </p>
      </div>

      <div className="space-y-4 text-left">
        {STEPS.map(({ icon: Icon, step, title, body }) => (
          <div
            key={step}
            className="flex items-center gap-5 rounded-2xl bg-gradient-to-br from-white to-gray-100 p-6 shadow-lg"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand-dark">
              <Icon className="h-7 w-7" strokeWidth={2} />
            </span>
            <div>
              <span className="inline-block rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">
                {step}
              </span>
              <h3 className="mt-1.5 text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/signup"
        className="inline-block rounded-full bg-gradient-to-r from-white to-gray-100 px-8 py-3.5 text-sm font-bold text-brand-dark shadow-glow transition hover:from-gray-100 hover:to-gray-200"
      >
        Start winning smarter →
      </Link>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <div className="flex -space-x-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-6 w-6 rounded-full border-2 border-black bg-gradient-to-br from-brand to-brand-dark"
            />
          ))}
        </div>
        Trusted by <span className="font-semibold text-brand-bright">28k+</span> Traders
      </div>
    </section>
  );
}
