import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'SUPABASE_']);
  const supabaseUrl =
    env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://ygfcoasnftbzavefmqmt.supabase.co';

  return {
    envPrefix: ['VITE_', 'SUPABASE_'],
    plugins: [
      react(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replaceAll('%VITE_SUPABASE_URL%', supabaseUrl);
        },
      },
      {
        name: 'serve-public-alias',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith('/public/')) {
              req.url = req.url.replace('/public/', '/');
            }
            next();
          });
        },
      },
      {
        name: 'async-css-transform',
        apply: 'build',
        enforce: 'post',
        transformIndexHtml(html) {
          // Convert render-blocking stylesheet link into non-blocking async load with noscript fallback
          return html.replace(
            /<link\s+rel="stylesheet"\s+crossorigin\s+href="([^"]+)">/gi,
            '<link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\'">\n    <noscript><link rel="stylesheet" href="$1"></noscript>'
          );
        },
      },
      visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      assetsInlineLimit: 0,
      sourcemap: false,
      reportCompressedSize: false,
      modulePreload: {
        resolveDependencies(filename, deps, { hostType }) {
          if (hostType === 'html') {
            // Keep heavy animation/secondary libraries off initial page preload
            return deps.filter(
              (dep) => !dep.includes('vendor-framer') && !dep.includes('vendor-gsap')
            );
          }
          return deps;
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react/') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-framer';
              }
              if (id.includes('gsap')) {
                return 'vendor-gsap';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
            }
          },
        },
      },
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
  };
})

