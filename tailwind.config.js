/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#004aad',
          600: '#003c8a',
          700: '#002d68',
          800: '#001f45',
          900: '#001023',
        },
        accent: {
          50: '#fff0e6',
          100: '#ffe1cc',
          200: '#ffc399',
          300: '#ffa466',
          400: '#ff914d',
          500: '#ff7733',
          600: '#cc5f29',
          700: '#99471f',
          800: '#663014',
          900: '#33180a',
        },
      },
      borderColor: {
        DEFAULT: '#475569', // slate-600 for darker borders
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        'md': '0.25rem',
        'lg': '0.375rem',
      }
    },
  },
  plugins: [],
};