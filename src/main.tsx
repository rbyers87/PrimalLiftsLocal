import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Use Vite's PWA plugin registration
// The plugin will handle service worker registration automatically
// based on the registerType: 'autoUpdate' setting

// We still need to manually register since we're using custom SW
// But we'll let Vite handle it

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: Register service worker manually if Vite doesn't handle it
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // The VitePWA plugin will register the service worker
  // This is just a fallback
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/PrimalLiftsLocal/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}
