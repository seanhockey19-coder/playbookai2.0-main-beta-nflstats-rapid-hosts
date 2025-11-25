/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./lib/**/*.{js,jsx,ts,tsx,mdx}", 
    "./**/*.{js,jsx,ts,tsx,mdx}", // <-- CATCH ALL (fixes everything)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
