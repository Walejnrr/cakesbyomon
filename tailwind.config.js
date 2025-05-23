/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./*.html", // If your HTML files are in the root of your project
    "./*.js",
    "./**/*.html", // To include HTML files in subdirectories
    "./src/**/*.{js,jsx,ts,tsx}", // If you have JavaScript/React/etc. files
    // Add more paths if you have other template files
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD6',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
          950: '#4C0519',
        },
        purple: { // Kept for reference but not primarily used in this palette
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2F0854',
        },
        // NEW COLORS FROM contact.html
        mint: {
          50: '#F0FFF4', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#77EDBB', 400: '#4CE0A6',
          500: '#26CC91', 600: '#1BA37A', 700: '#147A60', 800: '#0C5242', 900: '#052A29', 950: '#031715',
        },
        cream: '#FFFDD0', // Custom cream color
        lightpink: '#FFDCE2', // Custom light pink
        sky: { // Example light blue
          50: '#F0F9FF', 100: '#E0F2FE', 200: '#BAE6FD', 300: '#7DD3FC', 400: '#38BDF8',
          500: '#0EA5E9', 600: '#0284C7', 700: '#0369A1', 800: '#075985', 900: '#0C4A6E', 950: '#082F49',
        }
      },
    },
  }, // <--- THE COMMA MUST BE HERE!
  plugins: [],
}
