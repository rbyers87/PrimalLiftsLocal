import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Function to register service worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/PrimalLiftsLocal/sw.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
}

// Only register in production
if (import.meta.env.PROD) {
  registerServiceWorker();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
