/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8f0',
          100: '#d6efdb',
          200: '#afdcb9',
          300: '#87c894',
          400: '#62b676',
          500: '#3ea45b',
          600: '#2f8548',
          700: '#276b3c',
          800: '#225631',
          900: '#1d4729',
        },
        accent: {
          50: '#faf9f6',
          100: '#f2f0ea',
          200: '#e6e2d9',
          300: '#d8d1c4',
          400: '#beb4a2',
          500: '#9f927f',
          600: '#807563',
          700: '#655c4f',
          800: '#524a41',
          900: '#453f38',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        panel: '0 14px 42px rgba(21, 24, 27, 0.08)',
        'panel-dark': '0 20px 52px rgba(0, 0, 0, 0.42)',
        soft: '0 10px 28px rgba(17, 20, 24, 0.1)',
        'soft-dark': '0 12px 30px rgba(0, 0, 0, 0.46)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top left, rgba(22, 178, 109, 0.24), transparent 40%), radial-gradient(circle at 80% 15%, rgba(127, 159, 132, 0.18), transparent 28%)',
      },
      keyframes: {
        floatIn: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        floatIn: 'floatIn 500ms ease-out forwards',
      },
    },
  },
  plugins: [],
};
