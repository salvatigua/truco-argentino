/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        truco: {
          green: '#1b4332',
          felt: '#2d6a4f',
          gold: '#d4af37',
          paper: '#f8f9fa',
          wood: '#3a1f04',
        }
      }
    },
  },
  plugins: [],
}