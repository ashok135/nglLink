import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Makes /admin (and any sub-path) fallback to index.html so client-side routing works
    historyApiFallback: true,
  },
})
