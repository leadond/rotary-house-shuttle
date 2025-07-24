import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-map-gl': path.resolve(__dirname, 'node_modules/react-map-gl/dist/esm/index.js'),
    },
  },
});
