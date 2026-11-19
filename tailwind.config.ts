import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        siminv: {
          primary: "#1A3673",
          primaryHover: "#152C5E",
          navy: "#0F2148",
          blue: "#2563EB",
          lightBlue: "#EBF3FF",
          accent: "#3B82F6",
          dark: "#0F172A",
          muted: "#64748B",
          border: "#E2E8F0",
          cardBg: "#FFFFFF",
          pageBg: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

