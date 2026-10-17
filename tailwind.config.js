/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ea580c', // Orange accent
        secondary: '#0f172a', // Deep Navy
        'on-primary': '#ffffff',
        background: '#ffffff',
        surface: '#ffffff',
        'surface-variant': '#f8fafc',
        'surface-container': '#f1f5f9',
        'surface-container-lowest': '#ffffff',
        'on-surface': '#0f172a',
        'on-surface-variant': '#475569',
        'outline-variant': '#e2e8f0',
      },
      spacing: {
        'margin-mobile': '16px',
        'gutter': '32px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
        'base': '12px',
      },
      maxWidth: {
        'container-max': '1440px',
      },
      // Every stack falls through a metric-matched stand-in (defined in
      // src/fonts.css) before it reaches the generic family, so the moment the
      // real woff2 arrives nothing on the page reflows.
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Jakarta Fallback"', 'sans-serif'],
        serif: ['"Playfair Display"', '"Playfair Fallback"', 'serif'],
        'headline-xl': ['"Plus Jakarta Sans"', '"Jakarta Fallback"', 'sans-serif'],
        'headline-lg': ['"Plus Jakarta Sans"', '"Jakarta Fallback"', 'sans-serif'],
        'headline-md': ['"Plus Jakarta Sans"', '"Jakarta Fallback"', 'sans-serif'],
        'headline-sm': ['"Plus Jakarta Sans"', '"Jakarta Fallback"', 'sans-serif'],
        'label-caps': ['"Plus Jakarta Sans"', '"Jakarta Fallback"', 'sans-serif'],
        'body-lg': ['"Inter"', '"Inter Fallback"', 'sans-serif'],
        'body-md': ['"Inter"', '"Inter Fallback"', 'sans-serif'],
        'body-sm': ['"Inter"', '"Inter Fallback"', 'sans-serif'],
        'price-display': ['"Plus Jakarta Sans"', '"Jakarta Fallback"', 'sans-serif'],
      },
      fontSize: {
        'headline-xl': ['32px', '1.2'],
        'headline-lg': ['24px', '1.2'],
        'headline-md': ['20px', '1.2'],
        'headline-sm': ['18px', '1.2'],
        'label-caps': ['12px', '1'],
        'body-lg': ['16px', '1.5'],
        'body-md': ['14px', '1.5'],
        'body-sm': ['12px', '1.5'],
      },
      animation: {
        'marquee-fast': 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'antigravity': '0 20px 40px rgba(0,0,0,0.08)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
