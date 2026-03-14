/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f6ff',
          100: '#dce7ff',
          200: '#bdd1ff',
          300: '#8aafff',
          400: '#5d88ff',
          500: '#315fff',
          600: '#2448d4',
          700: '#1e3aa7',
          800: '#1d3386',
          900: '#1d2f6f',
        },
        accent: {
          50: '#effdf8',
          100: '#d7f8eb',
          200: '#b2f0d7',
          300: '#7de3bc',
          400: '#3fd09f',
          500: '#1db27f',
          600: '#129063',
          700: '#11734f',
          800: '#135c41',
          900: '#124c37',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 20px 60px rgba(20, 40, 120, 0.12)',
        'panel-dark': '0 20px 60px rgba(0, 0, 0, 0.45)',
        soft: '0 12px 30px rgba(15, 23, 42, 0.08)',
        'soft-dark': '0 12px 30px rgba(0, 0, 0, 0.35)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top left, rgba(49, 95, 255, 0.18), transparent 38%), radial-gradient(circle at 80% 20%, rgba(29, 178, 127, 0.15), transparent 28%)',
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
