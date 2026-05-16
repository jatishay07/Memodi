/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        'blush-rose':        '#DC4F7C',
        'tomato-jam':        '#C42B34',
        'vanilla-custard':   '#FCE9AB',
        'princeton-orange':  '#FC8A2D',
        'olive':             '#9E9820',
        'cream':             '#FFF9F0',
        'warm-white':        '#FFFBF7',
        'ink':               '#2D2D2D',
        'ink-soft':          '#6B6B6B',
        'ink-faint':         '#9C9C9C',
        // legacy aliases kept so nothing breaks
        navy:        '#0A0E1A',
        'navy-card': '#111827',
        'navy-border': '#1F2937',
        amber:       '#FC8A2D',
        pink:        '#DC4F7C',
      },
      fontFamily: {
        sans:  ['Nunito', 'Avenir Next', 'system-ui', 'sans-serif'],
        serif: ['Crimson Pro', 'Georgia', 'serif'],
      },
      borderRadius: {
        pill: '999px',
      },
    }
  },
  plugins: []
};
