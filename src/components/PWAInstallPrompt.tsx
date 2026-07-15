import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      console.log(`User ${result.outcome}`);
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-50 border dark:border-gray-700">
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <h3 className="font-semibold dark:text-gray-100">Install Primal Lifts</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Install this app on your device for the best experience.
          </p>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700"
            >
              <Download className="h-4 w-4" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1.5"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
