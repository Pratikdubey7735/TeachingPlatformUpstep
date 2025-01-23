/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',   // Custom breakpoint for extra small devices
        'sm': '640px',   // Small screens and up
        'md': '768px',   // Medium screens and up
        'lg': '1024px',  // Large screens and up
        'xl': '1280px',  // Extra large screens and up
        '2xl': '1536px', // 2x Extra large screens and up
        'max-sm': { max: '639px' }, // Custom max-width breakpoint for small screens
      },
    },
  },
  plugins: [],
};
