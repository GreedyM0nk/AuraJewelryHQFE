import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0A0A0A',
          charcoal: '#141414',
          gold: '#C9A84C',
          'gold-light': '#E8C97A',
          'gold-dark': '#8B6914',
          cream: '#F5F0E8',
          white: '#FAFAFA',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['Jost', 'sans-serif'],
        accent: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    },
  ],
}

export default config
