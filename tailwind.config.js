/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'purple-dark': '#0A0A0F',
        'purple-darker': '#1A0A2E',
        'purple-primary': '#9D4EDD',
        'purple-light': '#C77DFF',
        'purple-accent': '#E0AAFF',
        'purple-soft': '#DDA0DD',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'neural-pulse': 'neural-pulse 3s ease-in-out infinite',
        'electromagnetic': 'electromagnetic 4s ease-in-out infinite',
        'gradient-flow': 'gradient-flow 3s ease-in-out infinite',
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
      },
      backdropBlur: {
        'xl': '24px',
        '2xl': '40px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(157, 78, 221, 0.3)',
        'glow-lg': '0 0 40px rgba(157, 78, 221, 0.4)',
        'glow-xl': '0 0 60px rgba(157, 78, 221, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-strong': '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-purple': 'linear-gradient(135deg, #0A0A0F 0%, #1A0A2E 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(157, 78, 221, 0.1) 0%, rgba(199, 125, 255, 0.05) 100%)',
      },
      backgroundSize: {
        'grid': '50px 50px',
        '400%': '400% 400%',
      },
      blur: {
        '4xl': '72px',
      },
    },
  },
  plugins: [],
};