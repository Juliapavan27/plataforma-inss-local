import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        // Brand: deep navy — transmite confiança, autoridade, jurídico premium
        brand: {
          50: "#f3f6ff",
          100: "#e5ecff",
          200: "#c9d6ff",
          300: "#a1b6ff",
          400: "#6e8afc",
          500: "#4862f3",
          600: "#2d43e0",
          700: "#2232bd",
          800: "#1d2a95",
          900: "#182375",
          950: "#0b1140",
        },
        // Ink: neutros quentes — sensação premium, mais orgânica que cinza puro
        ink: {
          50: "#faf9f7",
          100: "#f1efeb",
          200: "#e1ddd4",
          300: "#c2bcae",
          400: "#928b7b",
          500: "#6b6557",
          600: "#504b41",
          700: "#3b372f",
          800: "#292620",
          900: "#1b1a16",
          950: "#0e0d0b",
        },
        // Gold: acento para selos, prêmios, CTAs secundários — sensação de autoridade jurídica
        gold: {
          50: "#fbf7ed",
          100: "#f6ebcf",
          200: "#ecd79b",
          300: "#e0bd65",
          400: "#d4a43d",
          500: "#bc8a28",
          600: "#9f6f1f",
          700: "#7f561b",
          800: "#67451d",
          900: "#563a1b",
          950: "#311f0d",
        },
        // Success: indicadores de êxito (score alto, validações)
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Fraunces", "Lora", "Georgia", "serif"],
        serif: ["Lora", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 6vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.035em" }],
        "display-lg": ["clamp(2.25rem, 4.5vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgb(15 23 42 / 0.15)",
        glow: "0 0 0 1px rgb(45 67 224 / 0.1), 0 20px 60px -20px rgb(45 67 224 / 0.35)",
        lift: "0 1px 0 0 rgb(255 255 255 / 0.6) inset, 0 1px 2px rgb(14 13 11 / 0.04), 0 8px 24px -8px rgb(14 13 11 / 0.12)",
        ring: "0 0 0 1px rgb(14 13 11 / 0.06), 0 1px 2px rgb(14 13 11 / 0.04)",
      },
      backgroundImage: {
        "grid-ink":
          "linear-gradient(to right, rgba(14,13,11,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,13,11,0.04) 1px, transparent 1px)",
        "noise":
          "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        "radial-brand":
          "radial-gradient(1200px 600px at 50% -10%, rgba(45,67,224,0.18), transparent 60%)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shine: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out both",
        "shine": "shine 3s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
