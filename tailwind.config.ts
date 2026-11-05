import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          950: "#050F30",
          900: "#0A1F5C",
          800: "#0E2976",
          700: "#12338F",
          600: "#1A44B8",
          500: "#2F5FD6",
          400: "#507EF0",
          200: "#C2D4FC",
          100: "#E3EAFB",
          50: "#F0F4FE",
        },
        sand: {
          50: "#FBF8F1",
          100: "#F5EFE0",
          200: "#EADFC8",
          300: "#DFD0B0",
          400: "#D4BE92",
          500: "#C2A875",
        },
        ink: "#0B1330",
        cream: "#FFFDF9",
      },
      fontFamily: {
        interTight: ["var(--font-inter-tight)", "var(--font-inter)", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        caveat: ["var(--font-caveat)", "cursive"],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(10, 31, 92, 0.06)',
        'elevated': '0 14px 40px rgba(10, 31, 92, 0.12)',
        'royal-glow': '0 10px 25px rgba(18, 51, 143, 0.25)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'marquee-slow': 'marquee 42s linear infinite',
        'marquee-fast': 'marquee 20s linear infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
