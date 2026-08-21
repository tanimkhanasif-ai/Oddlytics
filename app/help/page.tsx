import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Help & Support</h1>
        <p className="mt-1 text-sm text-gray-400">Questions, issues, or feedback — we're here.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs font-medium text-gray-400">Contact</p>
        <a href="mailto:support@oddlytics.app" className="mt-1 block text-sm text-brand-bright hover:underline">
          support@oddlytics.app
        </a>
        <p className="mt-2 text-xs text-gray-500">
          We typically respond within one business day.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs font-medium text-gray-400">Common questions</p>
        <p className="mt-1 text-sm text-gray-300">
          Billing, cancellation, and general FAQs are answered on the pricing page.
        </p>
        <Link href="/pricing#faq" className="mt-2 inline-block text-sm text-brand-bright hover:underline">
          View FAQs →
        </Link>
      </div>
    </div>
  );
}
