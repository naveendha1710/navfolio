import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.glb'],
  build: {
    // Code splitting for large vendor chunks (function format compatible with Rolldown & Rollup)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three';
            }
            if (id.includes('gsap')) {
              return 'vendor-gsap';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('lenis')) {
              return 'vendor-lenis';
            }
          }
        },
      },
    },
    // Increase chunk size warning threshold (three.js is large by nature)
    chunkSizeWarningLimit: 1000,
    // Use oxc minification (Vite 8 default)
    minify: 'oxc',
    target: 'esnext',
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'gsap', 'lenis', 'three'],
    exclude: [],
  },
});
