import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
    include: ['src/**/__tests__/**/*.{test,spec}.{js,jsx}', 'api/**/__tests__/**/*.{test,spec}.js'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/context/**', 'src/hooks/**', 'api/**'],
      exclude: ['**/__tests__/**', '**/test-setup.js'],
    },
  },
});
