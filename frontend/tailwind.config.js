// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tech: {
          dark: '#0a0a1a',
          card: '#111827',
          glass: 'rgba(17, 24, 39, 0.7)',
        },
        accent: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
        },
        secondary: '#1e293b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      boxShadow: {
        'neon': '0 0 5px rgba(59, 130, 246, 0.5), 0 0 15px rgba(59, 130, 246, 0.25)',
        'neon-lg': '0 0 12px rgba(59, 130, 246, 0.6), 0 0 25px rgba(59, 130, 246, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #3b82f6, #2563eb)',
        'gradient-primary': 'linear-gradient(135deg, #0a0a1a, #0f0f23)',
      },
    },
  },
  plugins: [],
}