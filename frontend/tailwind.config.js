/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0E1A',
        surface: '#0F1629',
        card: '#141B2D',
        'card-hover': '#19213A',
        border: '#1E2A45',
        accent: {
          DEFAULT: '#1B4FD8',
          hover: '#2563EB',
          light: '#3B82F6',
          muted: 'rgba(27,79,216,0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        glow: {
          '0%':   { textShadow: '0 0 20px rgba(27,79,216,0.5)' },
          '100%': { textShadow: '0 0 50px rgba(27,79,216,0.9), 0 0 90px rgba(27,79,216,0.4)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        glow:         'glow 2s ease-in-out infinite alternate',
        shimmer:      'shimmer 2s linear infinite',
        float:        'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
      },
      boxShadow: {
        accent:       '0 0 30px rgba(27,79,216,0.35)',
        'accent-sm':  '0 0 12px rgba(27,79,216,0.25)',
        card:         '0 4px 24px rgba(0,0,0,0.5)',
        'glow-red':   '0 0 20px rgba(239,68,68,0.3)',
        'glow-green': '0 0 20px rgba(16,185,129,0.3)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.3)',
      },
      backgroundImage: {
        'grid-faint': `
          linear-gradient(rgba(27,79,216,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(27,79,216,0.04) 1px, transparent 1px)
        `,
        'hero-radial': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(27,79,216,0.18) 0%, transparent 70%)',
        shimmer:       'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
