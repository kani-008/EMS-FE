// frontend/tailwind.config.js
// ./tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        grey: {
          300: "#d1d5db",
        },
      },
    },
  },
  plugins: [],
};

