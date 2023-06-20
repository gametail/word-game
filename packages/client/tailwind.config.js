/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./index.html"],

  plugins: [require("daisyui"), require("tailwindcss-animated")],
};
