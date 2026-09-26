/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090A0E',
        surface: {
          dark: '#0D0F15',
          elevated: '#131620',
          border: '#232838',
        },
        neon: {
          blue: '#00D1FF',
          cyan: '#00F0FF',
          glow: 'rgba(0, 209, 255, 0.15)',
        },
        premium: {
          gold: '#FFD700',
        }
      },
    },
  },
  plugins: [],
}
