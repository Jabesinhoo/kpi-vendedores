/** @type {import('tailwindcss').Config} */
export default {
  // 🔥 DEBE SER 'class'
  darkMode: 'class', 
  
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  
  theme: {
    extend: {
      colors: {
        'primary-kpi': '#1D4ED8', 
      },
      fontFamily: {
      sans: ["Verdana", "Geneva", "Tahoma", "sans-serif"],
    },
    },
  },
  plugins: [],
};