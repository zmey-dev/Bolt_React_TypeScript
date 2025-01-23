/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#fbbf24', // yellow-400
          hover: '#f59e0b', // yellow-500
          dark: '#260000',
          light: '#fef3c7', // yellow-100
        },
        background: {
          DEFAULT: '#260000',
          light: '#3b0000',
          dark: '#1a0000',
        }
      },
      colors: {
        purple: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};