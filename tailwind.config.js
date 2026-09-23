/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#cf1b22',
          red: '#cf1b22',
          gray: '#50504f',
          white: '#FFFFFF',
          soft: '#fce8e9',
          mute: '#f7f7f7',
        },
        // Remap legacy blue utilities → corporate red (no page-by-page rewrites)
        blue: {
          50: '#fef2f2',
          100: '#fce8e9',
          200: '#f9d0d2',
          300: '#f2a8ac',
          400: '#e66b71',
          500: '#d93a42',
          600: '#cf1b22',
          700: '#a8151b',
          800: '#8c1217',
          900: '#741014',
          950: '#40080a',
        },
        // Remap slate → warm institutional gray (#50504f family)
        slate: {
          50: '#f7f7f7',
          100: '#eeeeee',
          200: '#e2e2e1',
          300: '#c8c8c7',
          400: '#9a9a99',
          500: '#6e6e6d',
          600: '#50504f',
          700: '#40403f',
          800: '#2f2f2e',
          900: '#1f1f1e',
          950: '#121211',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brand: '0 10px 40px -12px rgba(207, 27, 34, 0.28)',
        panel: '0 8px 30px -10px rgba(80, 80, 79, 0.18)',
      },
      backgroundImage: {
        'brand-mesh':
          'radial-gradient(ellipse 80% 50% at 0% 0%, rgba(207, 27, 34, 0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(80, 80, 79, 0.08), transparent 50%), linear-gradient(180deg, #FFFFFF 0%, #f7f7f7 100%)',
        'brand-sidebar':
          'linear-gradient(180deg, #FFFFFF 0%, #fafafa 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
};
