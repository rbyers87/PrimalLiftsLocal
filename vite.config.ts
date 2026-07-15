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
      manifest: {
        name: 'Primal Lifts',
        short_name: 'PrimalLifts',
        description: 'Track your workouts offline',
        theme_color: '#4f46e5',
        background_color: '#1f2937',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/PrimalLiftsLocal/',
        start_url: '/PrimalLiftsLocal/',
        categories: ['fitness', 'health', 'lifestyle'],
        lang: 'en-US',
        icons: [
          {
            src: '/PrimalLiftsLocal/icons/android-icon-36x36.png',
            sizes: '36x36',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/PrimalLiftsLocal/icons/android-icon-48x48.png',
            sizes: '48x48',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/PrimalLiftsLocal/icons/android-icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/PrimalLiftsLocal/icons/android-icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/PrimalLiftsLocal/icons/android-icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/PrimalLiftsLocal/icons/android-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/PrimalLiftsLocal/icons/apple-icon-180x180.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/PrimalLiftsLocal/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        globIgnores: [
          '**/node_modules/**/*',
          'sw.js',
          'workbox-*.js',
          '**/*.map'
        ],
        // For HashRouter, we don't need navigateFallback
        // since all routes are served from index.html
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
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
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
