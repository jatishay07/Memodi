/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0A0E1A',
        'navy-card': '#111827',
        'navy-border': '#1F2937',
        amber: '#F5A623',
        'amber-bright': '#F7C948',
        cream: '#F5EDD4',
        pink: '#F4A0A0',
        gold: '#FFD580'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
