"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard, { authFieldClass } from "@/components/auth/AuthCard";
import { GlowButton } from "@/components/landing/primitives";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Sign up failed.");
        setLoading(false);
        return;
      }
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        setError("Account created — try logging in.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <AuthCard
      heading="Let's Get You Winning"
      sub="Get AI analysis on any market in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className={authFieldClass}
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={authFieldClass}
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (8+ characters)"
          className={authFieldClass}
        />
        {error && <p className="text-sm text-down">{error}</p>}
        <GlowButton type="submit" disabled={loading} className="w-full py-3 text-base">
          {loading ? "Creating account…" : "Continue with Email"}
        </GlowButton>
      </form>
    </AuthCard>
  );
}
