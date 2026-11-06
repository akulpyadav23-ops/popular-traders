/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7f5',
          100: '#e7ede8',
          200: '#d1ded3',
          300: '#b4c7b7',
          400: '#97b19b',
          500: '#7b977e', // Primary emerald accent (#7b977e)
          600: '#67806a',
          700: '#546956',
          800: '#415243',
          900: '#2f3c30',
        }
      }
    },
  },
  plugins: [],
}
