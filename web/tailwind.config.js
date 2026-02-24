/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'elite-primary': '#6D28D9',
        'elite-secondary': '#06B6D4',
        'elite-accent': '#F43F5E',
        'elite-bg': '#0F172A',
        'elite-surface': '#1E293B'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
