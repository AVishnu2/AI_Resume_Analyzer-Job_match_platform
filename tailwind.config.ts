import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef3ff',
          100: '#dce7ff',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
        },
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(17, 24, 39, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
