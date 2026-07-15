import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Only register service worker in production
if (import.meta.env.PROD) {
  // Register service worker manually
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/PrimalLifts/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
