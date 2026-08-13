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
        'marquee-slow': 'marquee 30s linear infinite',
        'marquee-vertical': 'marquee-vertical 20s linear infinite',
        // Preloader — all compositor-friendly (transform/opacity only), so the
        // main thread stays free for React to hydrate the real page behind it.
        // `backwards` matters: each element sets its own animation-delay inline,
        // and without it the falling pieces would sit visible at the top of the
        // screen until their delay elapsed instead of starting hidden.
        // Duration is supplied per-element inline.
        fall: 'fall linear infinite backwards',
        'spin-slow': 'spin-scale 4s linear infinite',
        'spin-slow-reverse': 'spin-scale-reverse 5s linear infinite',
        'rise-in': 'rise-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.5s ease-out both',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        float: 'float 3.5s ease-in-out infinite alternate',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-vertical': {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        fall: {
          '0%': { transform: 'translate3d(0, -200px, 0) rotate(var(--fall-from, 0deg))', opacity: '0' },
          '15%': { opacity: '0.6' },
          '85%': { opacity: '0.6' },
          '100%': { transform: 'translate3d(0, 120vh, 0) rotate(var(--fall-to, 0deg))', opacity: '0' },
        },
        'spin-scale': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        'spin-scale-reverse': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(-180deg) scale(1.2)' },
          '100%': { transform: 'rotate(-360deg) scale(1)' },
        },
        'rise-in': {
          '0%': { transform: 'translate3d(0, 50px, 0)', opacity: '0' },
          '100%': { transform: 'translate3d(0, 0, 0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translate3d(0, -100%, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        float: {
          '0%': { transform: 'translate3d(0, 0, var(--float-z, 0)) rotate(0deg)' },
          '100%': { transform: 'translate3d(0, -20px, var(--float-z, 0)) rotate(var(--float-tilt, 0deg))' },
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
