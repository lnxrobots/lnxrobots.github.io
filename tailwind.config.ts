import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // "Board" — near-black, with a faint green undertone kept only in
        // the raised/line steps so panels still read as a PCB substrate.
        board: {
          DEFAULT: "#000000",
          raised: "#0a0d0c",
          line: "#161c1a",
        },
        // "Copper" — the trace/pad metal. Warm, not neon.
        copper: {
          DEFAULT: "#c98a4b",
          bright: "#e3a361",
          dim: "#8a6238",
        },
        // "Signal" — reserved for live/active states only (pulses, links, countdown).
        signal: {
          DEFAULT: "#7fe7c4",
          bright: "#a8ffe3",
        },
        paper: {
          DEFAULT: "#eeeae1",
          muted: "#a9b0aa",
          faint: "#5f6863",
        },
        result: {
          gold: "#e3b341",
          silver: "#c7cdd1",
          bronze: "#c9793f",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "grid-fine":
          "linear-gradient(to right, rgba(238,234,225,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(238,234,225,0.035) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-fine": "28px 28px",
      },
      keyframes: {
        pulse_dash: {
          "0%": { strokeDashoffset: "240" },
          "100%": { strokeDashoffset: "0" },
        },
        via_glow: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "pulse-dash": "pulse_dash 3.2s linear infinite",
        "via-glow": "via_glow 2.4s ease-in-out infinite",
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
