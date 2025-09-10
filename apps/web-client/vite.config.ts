// @ts-nocheck
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = (env.VITE_UI_TARGET || 'web').toLowerCase()
  const entry = target === 'desktop' ? 'desktop.html' : 'web.html'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      host: true,
      open: `/${entry}`,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        input: path.resolve(__dirname, entry),
      },
    },
  }
})