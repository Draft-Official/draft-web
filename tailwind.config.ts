import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // ✅ Add src directory
  ],
  theme: {
    extend: {
      colors: {
        // Keep existing system colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "hsl(var(--border))",

        // Draft brand colors (Seed-compatible)
        draft: {
          50: '#FFF5EB',
          100: '#FFE5CC',
          200: '#FFCC99',
          300: '#FFB366',
          400: '#FF9933',
          500: '#FF6600',  // Primary
          600: '#E65C00',
          700: '#CC5200',
          800: '#B34700',
          900: '#993D00',
        },

        // Keep primary mapped to draft
        primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
