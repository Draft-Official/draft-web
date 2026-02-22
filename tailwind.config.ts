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
          50: '#FFF2EC',
          100: '#FFF2EC',
          200: '#FFD9C8',
          300: '#FFB999',
          400: '#FF905C',
          500: '#FF6F0F',
          600: '#E65200',
          700: '#FF6600',
          800: '#A53E00',
          900: '#8A3300',
          1000: '#702A00',
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
