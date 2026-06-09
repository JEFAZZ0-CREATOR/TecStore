// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Base surfaces
        void: '#07071a',          // deepest background
        surface: {
          DEFAULT: '#0e0e28',     // card background
          raised: '#141432',      // elevated elements
          overlay: '#1a1a3e',     // modals, dropdowns
        },
        // Accent palette
        violet: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        accent: {
          DEFAULT: '#6d28d9',     // primary violet
          light: '#a78bfa',       // light violet
          dark: '#5b21b6',        // dark violet
          blue: '#3b82f6',        // secondary blue
          'blue-light': '#60a5fa',
          cyan: '#22d3ee',        // highlight cyan
        },
        // Status colors
        success: '#10b981',
        'success-light': '#34d399',
        warning: '#f59e0b',
        'warning-light': '#fbbf24',
        danger: '#ef4444',
        'danger-light': '#f87171',
        info: '#22d3ee',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #6d28d9 0%, #3b82f6 60%, #22d3ee 100%)',
        'gradient-violet': 'linear-gradient(135deg, #6d28d9, #a78bfa)',
        'gradient-blue': 'linear-gradient(135deg, #3b82f6, #22d3ee)',
        'gradient-card': 'linear-gradient(145deg, rgba(20,20,60,0.9), rgba(13,13,30,0.95))',
        'gradient-surface': 'linear-gradient(180deg, #0e0e28, #07071a)',
        'gradient-primary': 'linear-gradient(135deg, #07071a, #0e0e28)',
      },
      boxShadow: {
        'neon':     '0 0 8px rgba(109,40,217,0.5), 0 0 20px rgba(59,130,246,0.25)',
        'neon-lg':  '0 0 16px rgba(109,40,217,0.6), 0 0 40px rgba(59,130,246,0.3), 0 0 60px rgba(34,211,238,0.15)',
        'neon-cyan':'0 0 10px rgba(34,211,238,0.5), 0 0 24px rgba(34,211,238,0.2)',
        'glass':    '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg': '0 16px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10)',
        'card':     '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
        'inset-glow': 'inset 0 0 30px rgba(109,40,217,0.1)',
        'button':   '0 4px 15px rgba(109,40,217,0.4), 0 2px 8px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'pulseGlow 2.5s ease-in-out infinite',
        'gradient': 'gradientFlow 4s ease infinite',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'slide-up': 'slideInUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(109,40,217,0.4), 0 0 20px rgba(59,130,246,0.2)' },
          '50%': { boxShadow: '0 0 16px rgba(109,40,217,0.7), 0 0 35px rgba(59,130,246,0.4)' },
        },
        gradientFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        slideInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      letterSpacing: {
        'widest': '0.2em',
      },
      lineHeight: {
        'tighter': '1.1',
      },
    },
  },
  plugins: [],
}