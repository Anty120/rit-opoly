import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/multiplayer': {
        target: 'http://127.0.0.1:2567', ws: true,
        rewrite: path => path.replace(/^\/multiplayer/, ''),
      },
    },
  },
})
