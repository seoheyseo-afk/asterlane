/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F7F0E6",
        rose: "#C7959D",
        deepRose: "#8D5F68",
        champagne: "#D8BE82",
        ink: "#4B4140",
        muted: "#9B8D89",
        vellum: "#FFF9F0",
        blush: "#E8D0D2",
        cocoa: "#6B5C59"
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Pretendard", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        bloom: "0 22px 60px rgba(141, 95, 104, 0.16)",
        cover: "0 14px 28px rgba(75, 65, 64, 0.12)"
      }
    }
  },
  plugins: []
};
