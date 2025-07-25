/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'spin': 'spin 1s linear infinite',
      },
      colors: {
        'dark-bg': '#1a1a1a',
      }
    },
  },
  plugins: [],
}