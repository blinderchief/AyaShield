import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#F9FAFB",
        "surface-2": "#F3F4F6",
        border: "#E5E7EB",
        "border-light": "#D1D5DB",
        primary: {
          DEFAULT: "#111827",
          light: "#374151",
          dark: "#030712",
        },
        accent: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
        },
        success: "#059669",
        warning: "#D97706",
        danger: "#DC2626",
        "danger-dark": "#991B1B",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        "text-muted": "#9CA3AF",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, #111827, #374151)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
