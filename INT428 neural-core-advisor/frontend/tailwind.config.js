/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0A0A0B',
        panel: '#111113',
        border: '#1e1e22',
        neon: {
          green: '#00FF94',
          purple: '#B535F6',
          blue: '#00C8FF',
        },
        text: {
          primary: '#E3E1E9',
          muted: '#6b6b7b',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00FF9440' },
          '100%': { boxShadow: '0 0 20px #00FF9480, 0 0 40px #00FF9420' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
