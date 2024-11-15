/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primary:"#6E00FF",
        secondary:"#9747FF",
        subtle:"#758398",
        "bg-0":"#EFF6FC", 
      },
      fontFamily: {  
        'roboto': ['Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}