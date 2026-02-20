/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Lato", "sans-serif"],
        serif: ["Lato", "sans-serif"], // Using Lato for serif as well for consistency
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "zoom-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "zoom-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" },
        },
        "zoom-in-95": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "zoom-out-95": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-left-1/2": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-top-48": {
          from: { transform: "translateY(-48%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-out-to-top": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-100%)" },
        },
        "slide-out-to-bottom": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        "slide-out-to-left": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        "slide-out-to-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "slide-out-to-left-1/2": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "slide-out-to-top-48": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-48%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-out": "fade-out 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        "zoom-in": "zoom-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "zoom-out": "zoom-out 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "zoom-in-95": "zoom-in-95 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "zoom-out-95": "zoom-out-95 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-from-top": "slide-in-from-top 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-from-bottom": "slide-in-from-bottom 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-from-left": "slide-in-from-left 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-from-right": "slide-in-from-right 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-out-to-top": "slide-out-to-top 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-out-to-bottom": "slide-out-to-bottom 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-out-to-left": "slide-out-to-left 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-out-to-right": "slide-out-to-right 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-from-left-1/2": "slide-in-from-left-1/2 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-from-top-48": "slide-in-from-top-48 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-out-to-left-1/2": "slide-out-to-left-1/2 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-out-to-top-48": "slide-out-to-top-48 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
}
