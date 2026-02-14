import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0B3D2E",
          foreground: "#F8FAFC",
          muted: "rgba(11, 61, 46, 0.08)",
        },
        accent: {
          DEFAULT: "#00D084",
          foreground: "#0B3D2E",
          muted: "rgba(0, 208, 132, 0.15)",
        },
        amber: {
          highlight: "#F59E0B",
          muted: "rgba(245, 158, 11, 0.15)",
        },
        dark: {
          DEFAULT: "#0F172A",
          panel: "#1E293B",
          elevated: "#334155",
          border: "#475569",
        },
        light: {
          DEFAULT: "#F8FAFC",
          panel: "#F1F5F9",
          border: "#E2E8F0",
        },
        muted: {
          DEFAULT: "#64748B",
          foreground: "#94A3B8",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "20px",
        md: "12px",
        sm: "8px",
      },
      spacing: {
        grid: "8px",
        18: "4.5rem",
        22: "5.5rem",
      },
      boxShadow: {
        glass: "0 4px 24px -1px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04)",
        "glass-dark":
          "0 4px 24px -1px rgba(0, 0, 0, 0.3), 0 2px 8px -2px rgba(0, 0, 0, 0.2)",
        glow: "0 0 40px -8px rgba(0, 208, 132, 0.25)",
        "glow-amber": "0 0 40px -8px rgba(245, 158, 11, 0.2)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-panel":
          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
