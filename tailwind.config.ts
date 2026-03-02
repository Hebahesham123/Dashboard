import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        surface: {
          900: '#0c0f14',
          800: '#13171f',
          700: '#1a1f2a',
          600: '#161b24',
        },
        border: '#252b36',
        accent: '#58a6ff',
        success: '#3fb950',
        warning: '#d29922',
      },
    },
  },
  plugins: [],
}
export default config
