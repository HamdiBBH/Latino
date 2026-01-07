import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Beach Club Color Palette
      colors: {
        primary: "#222222",
        secondary: "#FFFFFF",
        text: "#7A7A7A",
        accent: {
          DEFAULT: "#E8A87C",
          dark: "#C68B5B",
          light: "#F5D4C1",
        },
        gold: "#D4A853",
        teal: "#41B3A3",
        sand: "#F9F5F0",
        ocean: "#85DCB0",
      },
      // Typography
      fontFamily: {
        primary: ["Outfit", "sans-serif"],
      },
      fontSize: {
        hero: ["6rem", { lineHeight: "1.1" }],
        "3xl": ["3.5rem", { lineHeight: "1.2" }],
        "2xl": ["2.1rem", { lineHeight: "1.2" }],
        xl: ["1.6rem", { lineHeight: "1.4" }],
        lg: ["1.2rem", { lineHeight: "1.5" }],
        base: ["1.1rem", { lineHeight: "1.6" }],
        sm: ["0.9rem", { lineHeight: "1.5" }],
      },
      // Spacing
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "5rem",
        "3xl": "7rem",
      },
      // Border Radius
      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
        full: "100px",
      },
      // Shadows
      boxShadow: {
        sm: "0 2px 8px rgba(0,0,0,0.08)",
        md: "0 4px 20px rgba(0,0,0,0.1)",
        lg: "0 8px 40px rgba(0,0,0,0.15)",
        xl: "0 20px 60px rgba(0,0,0,0.2)",
      },
      // Transitions
      transitionDuration: {
        fast: "200ms",
        base: "300ms",
        slow: "500ms",
      },
      // Container
      maxWidth: {
        container: "1280px",
      },
      // Z-Index
      zIndex: {
        header: "1000",
        overlay: "100",
        modal: "2000",
      },
      // Animation keyframes
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        bounce: {
          "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-10px)" },
          "60%": { transform: "translateY(-5px)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateX(-50%) translateY(20px)" },
          "100%": { opacity: "1", transform: "translateX(-50%) translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 1s ease forwards",
        "fade-in": "fadeIn 0.5s ease",
        bounce: "bounce 2s infinite",
        "slide-up": "slideUp 0.3s ease",
      },
    },
  },
  plugins: [],
};

export default config;
