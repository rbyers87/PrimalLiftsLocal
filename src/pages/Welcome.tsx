import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';

export default function Welcome() {
  const [imageUrl, setImageUrl] = useState('/PrimalLifts/icons/placeholder-welcome.jpg');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImageUrl() {
      try {
        const url = await storage.settings.get('welcome_image_url');
        if (url) {
          setImageUrl(url);
        }
      } catch (error) {
        console.error('Error fetching welcome image URL:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchImageUrl();
  }, []);

  return (
    <div className="text-center flex flex-col items-center">
      <h1 className="text-4xl font-bold dark:text-gray-100 mb-4">Welcome to Primal Lifts</h1>
      <p className="text-lg dark:text-gray-300 mb-8">
        Workouts are scored by adding total weight moved and calories together for a total score! This app was built for those with a busy schedule and may need help keeping up with exercises you've completed and what you have left with weekly tracking.
      </p>
      <p className="text-lg dark:text-gray-300 mb-8">
        This app allows you to focus on the basic lifts but you can customize them in the settings menu.
      </p>
      {!loading && (
        <img
          src={imageUrl}
          alt="Fitness"
          className="mx-auto rounded-lg shadow-md mb-8 max-w-full"
          style={{ maxWidth: '90%', height: 'auto' }}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            (e.target as HTMLImageElement).src = '/PrimalLifts/icons/placeholder-welcome.jpg';
          }}
        />
      )}
      <p className="dark:text-gray-300">
        Use the navigation bar to access different features.
      </p>
    </div>
  );
}
