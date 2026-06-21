import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'military-green': '#1a3c2b',
        'military-green-light': '#2d5a3d',
        'military-gold': '#c8a94a',
        'military-gold-light': '#e8c96a',
        'dark-bg': '#0f1f17',
        'card-bg': '#152a1e',
      },
    },
  },
  plugins: [],
}
export default config
