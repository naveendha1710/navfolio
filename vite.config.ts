import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

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
    // Code splitting for large vendor chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei', '@react-three/rapier'],
          'vendor-gsap': ['gsap'],
          'vendor-motion': ['framer-motion'],
          'vendor-lenis': ['lenis'],
        },
      },
    },
    // Increase chunk size warning threshold (three.js is large by nature)
    chunkSizeWarningLimit: 1000,
    // Use terser-compatible minification
    minify: 'esbuild',
    target: 'esnext',
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'gsap', 'lenis', 'three'],
    exclude: [],
  },
});
