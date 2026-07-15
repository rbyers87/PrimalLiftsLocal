import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/PrimalLiftsLocal/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: false, // We'll use our own manifest.json
      workbox: {
        // Don't precache everything - just specific patterns
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        globIgnores: [
          '**/node_modules/**/*',
          'sw.js',
          'workbox-*.js',
          '**/*.map'
        ],
        // Configure navigation fallback for SPA
        navigateFallback: '/PrimalLiftsLocal/index.html',
        navigateFallbackDenylist: [
          /^\/_/,
          /\/api\//,
          /^\/PrimalLiftsLocal\/$/ // Allow the root of the subdirectory
        ],
        // Runtime caching for external resources
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      },
      // Development options
      devOptions: {
        enabled: true,
        type: 'module',
        suppressWarnings: true
      }
    })
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
