import path from "path"
import { fileURLToPath } from "url"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const viteCacheDir = `.vite-${process.pid}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  cacheDir: viteCacheDir,
  build: {
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
