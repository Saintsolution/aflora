import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
// @ts-expect-error The development middleware is a JavaScript module.
import { localCatalogPlugin } from './netlify/lib/local-catalog-plugin.mjs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localCatalogPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
