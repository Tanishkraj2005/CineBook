/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cinema: {
          bg: '#0f0f0f',
          surface: '#181818',
          'surface-2': '#242424',
          border: '#2c2c2c',
          accent: '#e63946',
          'accent-hover': '#c1121f',
          text: '#f1f1f1',
          muted: '#8e8e8e',
          success: '#2d9b4e',
          warning: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

