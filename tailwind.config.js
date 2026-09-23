import defaultTheme from 'tailwindcss/defaultTheme';

/**
 * Os valores reais das cores ficam em src/styles/index.css (CSS custom properties).
 * Aqui só mapeamos os tokens para classes do Tailwind — para trocar o acento,
 * edite --accent / --accent-rgb lá.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
    },
    extend: {
      colors: {
        surface: {
          DEFAULT: 'rgb(var(--bg-rgb) / <alpha-value>)',
          elevated: 'var(--bg-elevated)',
        },
        fg: {
          DEFAULT: 'var(--fg)',
          muted: 'var(--fg-muted)',
          subtle: 'var(--fg-subtle)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          soft: 'rgb(var(--accent-soft-rgb) / <alpha-value>)',
        },
        success: 'var(--success)',
        line: 'var(--border)',
      },
      fontFamily: {
        display: ['Oswald', '"Oswald Fallback"', 'Impact', 'sans-serif'],
        sans: ['Manrope', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
      },
    },
  },
  plugins: [],
};
