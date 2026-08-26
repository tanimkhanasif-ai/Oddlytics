"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Check, Star } from "lucide-react";
import { ProofBadge } from "@/components/app/ProofBadge";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.54c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.28-1.61 2.79-.41 6.92 1.15 9.18.76 1.11 1.67 2.35 2.86 2.31 1.15-.05 1.58-.74 2.97-.74 1.39 0 1.78.74 2.99.72 1.23-.02 2.02-1.13 2.78-2.24.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.66zM14.79 5.2c.64-.77 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.77-.97 2.82 1.02.08 2.07-.52 2.71-1.28z" />
    </svg>
  );
}

const PERKS = ["Instant AI analysis", "No credit card required", "Cancel anytime"];

/**
 * Shared sign-in / sign-up card. Google is wired to real NextAuth sign-in
 * (see lib/auth.ts) — if GOOGLE_CLIENT_ID/SECRET aren't set, NextAuth itself
 * shows its own error page rather than this card guessing at the reason.
 * Apple isn't built yet.
 */
export default function AuthCard({
  heading,
  sub,
  children,
  footer,
}: {
  heading: string;
  sub: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="w-full max-w-md">
      <div className="glass-panel rounded-3xl p-7 sm:p-8">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-3.5 py-1 text-xs font-semibold text-brand">
            <Check className="h-3.5 w-3.5" /> Join 28,000+ traders
          </span>
        </div>

        <h1 className="mt-5 text-center text-3xl font-extrabold tracking-tight text-foreground">
          {heading}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">{sub}</p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="ghost-button w-full px-4 py-3 text-sm"
          >
            <GoogleMark /> Continue with Google
          </button>

          <div className="relative">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="ghost-button w-full cursor-not-allowed px-4 py-3 text-sm opacity-45"
            >
              <AppleMark /> Continue with Apple
            </button>
            <span className="pointer-events-none absolute -top-2 right-2 rounded-full border border-brand/40 bg-background px-2 py-0.5 text-[10px] font-semibold text-brand">
              Coming soon
            </span>
          </div>
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {children}

        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="flex h-5 w-5 items-center justify-center rounded bg-brand/90">
                <Star className="h-3 w-3 fill-background text-background" />
              </span>
            ))}
          </div>
          <span className="text-sm font-semibold text-foreground">4.9/5</span>
          <span className="h-4 w-px bg-border" />
          <ProofBadge className="text-xs" />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {PERKS.map((p) => (
            <span key={p} className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-brand" /> {p}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p>
      <p className="mt-3 text-center">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to Oddlytics
        </Link>
      </p>
    </div>
  );
}

export const authFieldClass =
  "w-full rounded-xl border border-brand/25 bg-brand/[0.05] px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand/50";
