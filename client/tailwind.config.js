import animate from 'tailwindcss-animate';

// Colours are CSS variables holding "R G B" channels (defined in src/index.css) so that
// opacity modifiers such as bg-primary/10 work. Change the palette there, nowhere else.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' }, screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        background: token('background'),
        foreground: token('foreground'),
        card: { DEFAULT: token('card'), foreground: token('foreground') },
        popover: { DEFAULT: token('card'), foreground: token('foreground') },
        primary: { DEFAULT: token('primary'), foreground: token('primary-foreground') },
        secondary: { DEFAULT: token('secondary'), foreground: token('foreground') },
        muted: { DEFAULT: token('muted'), foreground: token('muted-foreground') },
        accent: { DEFAULT: token('accent'), foreground: token('foreground') },
        destructive: { DEFAULT: token('destructive'), foreground: '#fff' },
        border: token('border'),
        input: token('input'),
        ring: token('ring'),
        // Brand palette
        leaf: token('leaf'),
        fresh: token('fresh'),
        forest: token('forest'),
        soil: { DEFAULT: token('soil'), light: token('soil-light') },
        cream: token('cream'),
      },
      fontFamily: { sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'] },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
      boxShadow: {
        nav: '0 1px 2px rgb(16 33 22 / 0.06)',
        card: '0 1px 2px rgb(16 33 22 / 0.05)',
        'card-hover': '0 6px 18px rgb(16 33 22 / 0.10)',
      },
    },
  },
  plugins: [animate],
};
