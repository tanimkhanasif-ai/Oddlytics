import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (ported from the Lovable landing design system).
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        violet: "var(--violet)",
        proof: "var(--proof)",
        "on-brand": "var(--on-brand)",

        // Product colours kept for the authenticated app.
        yes: "#22c55e",
        no: "#ef4444",
        brand: {
          DEFAULT: "var(--brand)",
          light: "var(--brand-light)",
          bright: "#4ade80",
          dark: "#16a34a",
          deep: "#052e16",
        },
      },
      fontFamily: {
        sans: ["var(--font-archivo)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-archivo)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "calc(var(--radius) + 16px)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 197, 94, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
