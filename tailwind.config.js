/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#6D28D9',
          violet: '#A855F7',
          pink: '#EC4899',
          surface: '#F5F3FF',
        },
        surface: {
          canvas: '#FAFAFC',
          card: '#FFFFFF',
          muted: '#F4F4F5',
        },
        border: {
          subtle: '#E4E4E7',
          active: '#D4D4D8',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #6D28D9 0%, #A855F7 48%, #EC4899 100%)',
        'brand-gradient-hover': 'linear-gradient(120deg, #5B21B6 0%, #9333EA 48%, #DB2777 100%)',
        'subtle-gradient': 'linear-gradient(180deg, rgba(245, 243, 255, 0.7) 0%, rgba(255, 255, 255, 0.9) 100%)',
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(109, 40, 217, 0.25)',
        'brand-lg': '0 10px 25px -3px rgba(109, 40, 217, 0.2)',
      },
    },
  },
  plugins: [],
}
