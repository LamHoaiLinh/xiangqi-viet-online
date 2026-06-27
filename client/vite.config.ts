import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    proxy: {
      '/socket.io': 'http://localhost:3000',
      '/api': 'http://localhost:3000'
    },
    fs: { allow: [path.resolve(__dirname), path.resolve(__dirname, '..')] }
  }
});
