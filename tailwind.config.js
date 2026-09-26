/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        outer: '#C9A8D8',
        ink: '#15111C',
        sidebar: '#141018',
        card: '#1E1826',
        line: '#2A2432',
        frost: '#F5F3F7',
        mute: '#9B93A8',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        float: '0 28px 70px rgba(58, 22, 86, 0.28)',
        glow: '0 0 32px rgba(124, 108, 255, 0.28)',
      },
      borderRadius: {
        shell: '24px',
      },
    },
  },
  plugins: [],
};
