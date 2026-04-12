/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // All colors driven by CSS variables — switch light/dark by toggling .dark on <html>
        "brand-blue": {
          DEFAULT: "var(--color-brand-blue)",
          50: "var(--color-brand-blue-50)",
          100: "var(--color-brand-blue-100)",
          200: "var(--color-brand-blue-200)",
          300: "var(--color-brand-blue-300)",
          400: "var(--color-brand-blue-400)",
          500: "var(--color-brand-blue-500)",
          600: "var(--color-brand-blue-600)",
          700: "var(--color-brand-blue-700)",
          800: "var(--color-brand-blue-800)",
          900: "var(--color-brand-blue-900)",
        },
        "brand-primary": {
          DEFAULT: "var(--color-brand-primary)",
          light: "var(--color-brand-primary-light)",
          dark: "var(--color-brand-primary-dark)",
        },
        "brand-accent": {
          DEFAULT: "var(--color-brand-accent)",
          light: "var(--color-brand-accent-light)",
          dark: "var(--color-brand-accent-dark)",
        },
        "brand-white": "var(--color-brand-white)",

        "brand-gradient-start": "var(--color-gradient-start)",
        "brand-gradient-end": "var(--color-gradient-end)",

        // Semantic text color — always readable (dark brand blue in light, light blue in dark)
        "brand-text": {
          DEFAULT: "var(--color-brand-text)",
          70: "var(--color-brand-text-70)",
          60: "var(--color-brand-text-60)",
          50: "var(--color-brand-text-50)",
          10: "var(--color-brand-text-10)",
        },

        // Background colors
        "bg-primary": "var(--color-bg-primary)",
        "bg-secondary": "var(--color-bg-secondary)",
        // bg-white supports /opacity modifier via space-separated RGB channels
        "bg-white": "rgb(var(--color-bg-white-rgb) / <alpha-value>)",
        "bg-card": "var(--color-bg-card)",
        "bg-light-blue": "var(--color-bg-light-blue)",

        // Stroke / Border colors
        "stroke-primary": "var(--color-stroke-primary)",
        "stroke-light": "var(--color-stroke-light)",

        // Accent colors
        "accent-orange": {
          DEFAULT: "var(--color-accent-orange)",
          light: "var(--color-accent-orange-light)",
          dark: "var(--color-accent-orange-dark)",
        },
        "accent-yellow": {
          DEFAULT: "var(--color-accent-yellow)",
          light: "var(--color-accent-yellow-light)",
          dark: "var(--color-accent-yellow-dark)",
        },
        "accent-green": {
          DEFAULT: "var(--color-accent-green)",
          light: "var(--color-accent-green-light)",
          dark: "var(--color-accent-green-dark)",
        },
        "accent-red": {
          DEFAULT: "var(--color-accent-red)",
          light: "var(--color-accent-red-light)",
          dark: "var(--color-accent-red-dark)",
        },
        "accent-blue": {
          DEFAULT: "var(--color-accent-blue)",
          light: "var(--color-accent-blue-light)",
          dark: "var(--color-accent-blue-dark)",
        },
        "accent-olive": {
          DEFAULT: "var(--color-accent-olive)",
          light: "var(--color-accent-olive-light)",
          dark: "var(--color-accent-olive-dark)",
        },

        // Neutral gray scale — INVERTS between light and dark
        "provider-bg": "var(--color-provider-bg)",
        "provider-border": "var(--color-provider-border)",
        "provider-border-hover": "var(--color-provider-border-hover)",
        "provider-overlay": "var(--color-provider-overlay)",

        "neutral-gray": {
          50: "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)",
        },

        // Betting odds colors
        "odds-back": "var(--color-odds-back)",
        "odds-lay": "var(--color-odds-lay)",
        "odds-positive": "var(--color-odds-positive)",
        "odds-negative": "var(--color-odds-negative)",
        // Fixed 1xBet-style odds button colors (not theme-variable)
        "odds-back-dark": "#1d4b7a",
        "odds-lay-dark": "#7a1d1d",
      },

      fontFamily: {
        sans: ["Roboto", "Arial", "sans-serif"],
        display: ["Montserrat", "Roboto Condensed", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
      },

      // Shadows reference CSS variables so they can change per theme
      boxShadow: {
        "betting-card": "var(--shadow-betting-card)",
        "odds-hover": "var(--shadow-odds-hover)",
        elevated: "var(--shadow-elevated)",
      },

      // Gradients reference CSS variables — full gradient strings stored in vars
      backgroundImage: {
        "hero-gradient": "var(--gradient-hero)",
        "cta-gradient": "var(--gradient-cta)",
        "card-gradient": "var(--gradient-card)",
        "odds-gradient": "var(--gradient-odds)",
      },

      animation: {
        "pulse-odds": "pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1)",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-in",
      },

      transitionDuration: {
        300: "300ms",
      },

      spacing: {
        "sidebar-collapsed": "50px",
        "sidebar-expanded": "250px",
      },

      zIndex: {
        header: "50",
        sidebar: "40",
        content: "10",
      },

      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
