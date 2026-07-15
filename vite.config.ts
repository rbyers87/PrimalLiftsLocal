import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/PrimalLifts/',
  plugins: [
    react()
    // Remove VitePWA for now - we'll handle service worker manually
  ],
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
