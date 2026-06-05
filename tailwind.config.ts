import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backdrop
        noir: "#000000",
        ink: "#050a1a",
        // Navy system — the Librum primary surface
        navy: "#0E1638",
        carbon: "#14193a",
        steel: "#1f2547",
        // Neutrals
        ash: "#6b7280",
        bone: "#f5f0e8",
        // Brand accents
        spark: "#d4ff3d",    // electric lime — signature
        magenta: "#ff2d8f",  // hot pink — punctuation
        cyan: "#1fc9d7",     // electric cyan — punctuation
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
