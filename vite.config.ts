import path from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Treat .wasm files as static assets — prevents SPA fallback returning HTML
  assetsInclude: ['**/*.wasm'],
  // Exclude onnxruntime-web from pre-bundling — breaks WASM path resolution
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdfjs': ['pdfjs-dist'],
          'pdf-lib': ['pdf-lib'],
          'onnxruntime': ['onnxruntime-web'],
        },
      },
    },
  },
})
