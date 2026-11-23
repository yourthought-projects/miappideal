/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.html", "./public/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        ink: '#111439',
        lilac: '#F8F8F9',
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#4f6ef7',
          600: '#3355e8',
          700: '#2643c4',
          800: '#1c3399',
          900: '#111439',
          950: '#0a0c26',
        }
      }
    }
  },
  plugins: [],
}

