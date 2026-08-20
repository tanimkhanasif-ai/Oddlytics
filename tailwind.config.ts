import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        yes: "#22c55e",
        no: "#ef4444",
        brand: {
          DEFAULT: "#22c55e",
          bright: "#4ade80",
          dark: "#16a34a",
          deep: "#052e16",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 197, 94, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
