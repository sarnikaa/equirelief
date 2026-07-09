/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#050709',
          900: '#0a0d12',
          800: '#111620',
          700: '#1a2130',
          600: '#243040',
        },
        signal: {
          DEFAULT: '#00e5a0',
          dim: '#00b87e',
          faint: 'rgba(0,229,160,0.08)',
        },
        amber: {
          alert: '#f59e0b',
          faint: 'rgba(245,158,11,0.08)',
        },
        coral: {
          DEFAULT: '#ff6b6b',
          faint: 'rgba(255,107,107,0.08)',
        },
        sky: {
          data: '#38bdf8',
          faint: 'rgba(56,189,248,0.08)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
