import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Listen for service worker updates
    const handleUpdate = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowUpdate(true);
      }
    };

    // Check for updates periodically
    const checkForUpdates = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowUpdate(true);
              }
            });
          }
        });
      }
    };

    if ('serviceWorker' in navigator) {
      checkForUpdates();
      
      // Listen for controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload page when new service worker takes over
        window.location.reload();
      });
    }

    return () => {
      // Cleanup
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdate(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 z-50 border dark:border-gray-700 animate-slide-down">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-spin-slow" />
          <div>
            <p className="font-medium dark:text-gray-100">Update Available</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">A new version is ready to install.</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-3"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={handleUpdate}
        className="mt-3 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        Update Now
      </button>
    </div>
  );
}
