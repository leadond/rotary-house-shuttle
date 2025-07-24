import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'mapbox-gl': 'mapbox-gl/dist/mapbox-gl.js',
      'react-map-gl': 'react-map-gl/dist/es/index.js'
    }
  },
  optimizeDeps: {
    include: ['mapbox-gl', 'react-map-gl']
  },
  server: {
    port: 3000
  }
})