import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'mapbox-gl': 'mapbox-gl/dist/mapbox-gl.js'
    }
  },
  optimizeDeps: {
    include: ['react-map-gl', 'mapbox-gl']
  },
  server: {
    port: 3000
  }
})