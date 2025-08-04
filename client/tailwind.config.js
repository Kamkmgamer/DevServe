/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enables dark mode based on a class
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};