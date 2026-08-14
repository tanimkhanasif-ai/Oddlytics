import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        yes: "#22c55e",
        no: "#ef4444",
      },
    },
  },
  plugins: [],
};

export default config;
