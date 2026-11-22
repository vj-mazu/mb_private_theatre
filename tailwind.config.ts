import type { Config } from 'tailwindcss';

// Movie Bash palette: sky blue (brand) · creamy white (surface) · deep navy (ink).
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F8FE',
          100: '#DDF0FC',
          200: '#B9E1F8',
          300: '#86CBF1',
          400: '#4FB3E8',
          500: '#2A9BD9',
          600: '#167DBA',
          700: '#126496',
        },
        cream: {
          DEFAULT: '#FBF7EF',
          deep: '#F3ECDF',
          card: '#FFFDF9',
        },
        navy: {
          DEFAULT: '#0E2A47',
          soft: '#4A5E74',
          faint: '#8A99AA',
        },
        line: '#E7DFD1',
        // Single premium accent: warm champagne gold (frames, rules, highlights).
        gold: {
          100: '#FBF3DE',
          200: '#F3E3B5',
          300: '#E7C77D',
          400: '#D9B25F',
          500: '#C9962E',
          600: '#A87A1F',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14,42,71,0.04), 0 8px 24px -12px rgba(14,42,71,0.12)',
        lift: '0 2px 4px rgba(14,42,71,0.05), 0 20px 40px -16px rgba(14,42,71,0.22)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        marquee: 'marquee 40s linear infinite',
        'marquee-slow': 'marquee 60s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin-slow 24s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
