import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';

export function UserList() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const data = await storage.profile.get();
        if (data) {
          setProfiles([data]);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium dark:text-gray-100">Users</h3>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        {profiles.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No users found.</p>
        ) : (
          <ul className="space-y-2">
            {profiles.map((profile) => (
              <li key={profile.id} className="flex items-center justify-between">
                <span className="dark:text-gray-100">{profile.profile_name || profile.email}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.email}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
