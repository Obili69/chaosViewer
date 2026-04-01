/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        base: '#0a0f14',
        surface: '#111827',
        elevated: '#1a2332',
        border: '#1e2d42',
        accent: {
          DEFAULT: '#06b6d4',
          dim: '#0891b2',
          glow: '#06b6d420',
        },
        highlight: {
          DEFAULT: '#10b981',
          dim: '#059669',
        },
        text: {
          primary: '#f0f9ff',
          secondary: '#b0bec5',
          muted: '#64748b',
        },
        status: {
          open: '#94a3b8',
          progress: '#06b6d4',
          done: '#10b981',
          blocked: '#f43f5e',
          resolved: '#10b981',
          closed: '#475569',
        },
        priority: {
          low: '#475569',
          medium: '#f59e0b',
          high: '#f97316',
          critical: '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        glow: '0 0 20px rgba(6, 182, 212, 0.15)',
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
