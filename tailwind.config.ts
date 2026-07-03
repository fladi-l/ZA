import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Basis
        paper: "#FFFFFF",
        sand: {
          DEFAULT: "#E8DCC4",
          light: "#F5EFE0",
          dark: "#D8C89E",
        },
        bush: {
          // Dunkelgrün, Buschveld
          50: "#EAF0EC",
          100: "#C7D9CD",
          300: "#5C8B6E",
          500: "#2C5240",
          700: "#1B3A2F",
          900: "#0F241D",
        },
        terracotta: {
          // Akzent, Kalahari-Sonnenuntergang – bewusst sparsam einsetzen
          DEFAULT: "#C1622D",
          light: "#DD8752",
          dark: "#9A4A1F",
        },
        gold: "#B8935A",
        ink: "#20241F",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 36, 29, 0.04), 0 8px 24px -8px rgba(15, 36, 29, 0.12)",
        cardHover: "0 2px 4px rgba(15, 36, 29, 0.06), 0 16px 32px -12px rgba(15, 36, 29, 0.18)",
      },
      backgroundImage: {
        horizon:
          "radial-gradient(120% 60% at 50% 100%, rgba(193,98,45,0.16) 0%, rgba(193,98,45,0) 60%)",
      },
    },
  },
  plugins: [],
};
export default config;
