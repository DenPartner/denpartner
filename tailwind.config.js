/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🌿 PRIMARY BRAND (Dark Green)
        primary: "#14532D",

        // 💰 GOLD (Premium button color)
        gold: "#D4AF37",

        // 🎨 BACKGROUND
        bg: "#F8F9FA",

        // 📝 TEXT COLORS
        textMain: "#121212",
        textSub: "#6C757D",
      },
    },
  },
  plugins: [],
};