import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070f0c',
          900: '#0a1712',
          800: '#101f19',
          700: '#152820',
          600: '#1c342a',
        },
        mint: {
          300: '#8ff0c9',
          400: '#5fe3ac',
          500: '#34d399',
          600: '#22b586',
        },
        gold: {
          300: '#f2d888',
          400: '#e8c563',
          500: '#dcae3a',
        },
        harmonyHigh: '#e28b7a',
        harmonyLow: '#8b8cf0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '22px',
        pill: '999px',
      },
      boxShadow: {
        glow: '0 0 40px rgba(95, 227, 172, 0.15)',
      },
    },
  },
  plugins: [],
} satisfies Config;
