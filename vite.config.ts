import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/Jiya_work_space/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router')) {
            return 'vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 500
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
