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
        charcoal: {
          950: "#0b0c0e",
          900: "#111216",
          850: "#16181f",
          800: "#1b1d26",
          750: "#222530",
          700: "#2d303e",
          600: "#3e4253",
          500: "#555b70",
          400: "#7c849e",
          300: "#a9b0c6",
          200: "#d3d7e5",
          100: "#eef1f8",
        },
        brand: {
          purple: {
            light: "#a78bfa",
            DEFAULT: "#8b5cf6",
            dark: "#7c3aed",
            deep: "#6d28d9",
            glow: "rgba(139, 92, 246, 0.15)",
          },
          green: {
            light: "#34d399",
            DEFAULT: "#10b981",
            dark: "#059669",
            glow: "rgba(16, 185, 129, 0.15)",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

