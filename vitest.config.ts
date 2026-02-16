import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: [
        'src/types/**/*.ts',
        'src/lib/**/*.ts',
        'src/constants/**/*.ts',
        'src/hooks/useAsyncOperation.ts',
        'src/hooks/useDocumentOps.ts',
        'src/services/asyncOperation.ts',
        'src/services/persistence.ts',
        'src/services/imageService.ts',
        'src/services/pdfExportService.ts',
        'src/services/documentService.ts',
        'src/services/pdfBinaryStore.ts',
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/test/**',
        'src/lib/pdfWorker.ts',
        'src/lib/fileDialog.ts',
      ],
    },
  },
})
