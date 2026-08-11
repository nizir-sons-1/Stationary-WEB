import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // Inline nothing as base64 — small files still benefit from the CDN's
    // immutable cache, and inlining bloats the render-blocking CSS.
    assetsInlineLimit: 0,
    sourcemap: false,
    reportCompressedSize: false,
    // Deliberately no `manualChunks`. Hand-grouping the vendors here made the
    // first load *worse*: react/jsx-runtime ended up sharing a chunk with
    // framer-motion, and because every component needs the JSX runtime, the
    // entry then had to preload all of framer-motion — ~40 kB gzip that only
    // three lazy routes actually use. Rolldown's default splitting isolates the
    // JSX runtime correctly and leaves framer-motion, gsap and supabase behind
    // their dynamic imports, which is exactly what we want.
  },
  // Pre-bundle the deps the first paint needs so cold `npm run dev` isn't slow.
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react-router-dom'],
  },
})
