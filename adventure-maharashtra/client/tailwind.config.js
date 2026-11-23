/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#050914',
          secondary: '#080F1D',
          card: '#0B1220',
          elevated: '#101A2D',
        },
        brand: {
          cyan: '#38BDF8',
          blue: '#2563EB',
          amber: '#F59E0B',
          darkBlue: '#1D4ED8',
        },
        content: {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.09)',
          medium: 'rgba(255, 255, 255, 0.16)',
          accent: 'rgba(56, 189, 248, 0.3)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(56, 189, 248, 0.3)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
