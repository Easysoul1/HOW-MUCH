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
          DEFAULT: "#0F0F0F", // Black for primary brand
          foreground: "#FFFFFF",
          muted: "#1A1A1A",
        },
        brand: {
          DEFAULT: "#0B3D2E", // Keep deep green as brand identifier
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#00D084",
          foreground: "#000000",
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          info: "#3B82F6",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          elevated: "#FEFEFE", // High brightness for clean look
          muted: "#F4F4F4",
          dim: "#E4E4E7",
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
          DEFAULT: "#71717A",
          foreground: "#A1A1AA",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "display-md": ["1.75rem", { lineHeight: "1.25", letterSpacing: "-0.015em" }],
        "display-sm": ["1.375rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "caption": ["0.8125rem", { lineHeight: "1.4" }],
        "overline": ["0.75rem", { lineHeight: "1.3", letterSpacing: "0.04em" }],
      },
      letterSpacing: {
        heading: "-0.02em",
        tight: "-0.015em",
        wide: "0.02em",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      maxWidth: {
        container: "1280px",
        content: "720px",
        narrow: "480px",
      },
      spacing: {
        grid: "8px",
        18: "4.5rem",
        22: "5.5rem",
        section: "5rem",
        "section-sm": "4rem",
      },
      boxShadow: {
        glass: "0 4px 24px -1px rgba(0, 0, 0, 0.06), 0 2px 8px -2px rgba(0, 0, 0, 0.04)",
        "glass-dark":
          "0 4px 24px -1px rgba(0, 0, 0, 0.28), 0 2px 8px -2px rgba(0, 0, 0, 0.18)",
        glow: "0 0 32px -8px rgba(0, 208, 132, 0.2)",
        "glow-amber": "0 0 32px -8px rgba(245, 158, 11, 0.16)",
        "inner-soft": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)",
        "inner-soft-dark": "inset 0 1px 0 0 rgba(255, 255, 255, 0.04)",
        "card-hover": "0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-hero": "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.88) 50%, rgba(241,245,249,0.95) 100%)",
        "gradient-hero-dark": "linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.92) 100%)",
        "glass-panel":
          "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        smooth: "280ms",
      },
      animation: {
        "fade-in": "fadeIn 0.28s ease-out",
        "slide-up": "slideUp 0.28s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
