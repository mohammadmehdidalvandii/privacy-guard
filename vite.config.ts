import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },

  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(import.meta.dirname, 'index.html'),
        background: path.resolve(
          import.meta.dirname,
          'src/background/service-worker.ts',
        ),
      },

      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js'

          return 'assets/[name]-[hash].js'
        },
      },
    },
  },
})
