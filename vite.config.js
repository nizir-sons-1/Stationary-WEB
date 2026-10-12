import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-public-alias',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/public/')) {
            req.url = req.url.replace('/public/', '/');
          }
          next();
        });
      },
    },
  ],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 0,
    sourcemap: false,
    reportCompressedSize: false,
  },
  server: {
    watch: {
      ignored: ['**/*.mp4', '**/*.webm', '**/*.mkv', '**/*.avi', '**/*.mov', '**/videos/**', '**/node_modules/**'],
    },
  },
  // Pre-bundle the deps the first paint needs so cold `npm run dev` isn't slow.
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react-router-dom'],
  },
})
