import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/PrimalLiftsLocal/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'dexie': ['dexie'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
});
