import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Clean, professional palette inspired by Mercury/Linear/Vercel
        background: "#FFFFFF",
        surface: "#FAFAFA",
        "surface-2": "#F5F5F5",
        border: "#E5E5E5",
        "border-light": "#D4D4D4",
        primary: {
          DEFAULT: "#0A0A0A",
          light: "#171717",
          dark: "#000000",
        },
        accent: {
          DEFAULT: "#0066FF",
          light: "#3385FF",
          dark: "#0052CC",
        },
        success: "#00A67E",
        warning: "#F59E0B",
        danger: "#EF4444",
        "danger-dark": "#DC2626",
        "text-primary": "#0A0A0A",
        "text-secondary": "#525252",
        "text-muted": "#A3A3A3",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["SF Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        // Refined type scale
        "display": ["3.5rem", { lineHeight: "1.1", fontWeight: "600", letterSpacing: "-0.02em" }],
        "headline": ["2.25rem", { lineHeight: "1.2", fontWeight: "600", letterSpacing: "-0.02em" }],
        "title": ["1.5rem", { lineHeight: "1.3", fontWeight: "600", letterSpacing: "-0.01em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
        "gradient-subtle": "linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        "nav": "0 1px 0 rgba(0,0,0,0.05)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
