import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

// Build output goes straight into ../frontend so the FastAPI backend
// can serve the SPA (index.html at /, assets at /assets/*).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  base: '/',
  build: {
    outDir: '../frontend',
    emptyOutDir: true,
    sourcemap: false,
  },
})
