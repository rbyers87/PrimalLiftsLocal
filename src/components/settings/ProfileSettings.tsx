import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { differenceInYears, parseISO } from 'date-fns';

export function ProfileSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    profile_name: '',
    birthday: '',
    gender: '',
    avatar_url: '',
    avatar_data: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const data = await storage.profile.get();
        setProfile(data);
        if (data) {
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            profile_name: data.profile_name || '',
            birthday: data.birthday || '',
            gender: data.gender || '',
            avatar_url: data.avatar_url || '',
            avatar_data: data.avatar_data || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    try {
      await storage.profile.update({
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        profile_name: formData.profile_name || null,
        birthday: formData.birthday || null,
        gender: formData.gender || null,
        avatar_url: formData.avatar_url || null,
        avatar_data: formData.avatar_data || null,
      });
      setMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpdating(true);
    setMessage('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        setFormData(prev => ({ ...prev, avatar_data: base64Data }));
        
        // Update immediately
        await storage.profile.update({
          avatar_data: base64Data
        });
        setMessage('Avatar uploaded successfully');
        setUpdating(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage('Error uploading avatar');
      setUpdating(false);
    }
  };

  const calculateAge = (birthday: string | null) => {
    if (!birthday) return null;
    try {
      return differenceInYears(new Date(), parseISO(birthday));
    } catch (error) {
      console.error('Error calculating age:', error);
      return null;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
      <h2 className="text-xl font-bold dark:text-gray-100 mb-4">Profile Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium dark:text-gray-300">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium dark:text-gray-300">
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="profile_name" className="block text-sm font-medium dark:text-gray-300">
            Profile Name
          </label>
          <input
            type="text"
            id="profile_name"
            value={formData.profile_name}
            onChange={(e) => setFormData(prev => ({ ...prev, profile_name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="birthday" className="block text-sm font-medium dark:text-gray-300">
              Birthday
            </label>
            <input
              type="date"
              id="birthday"
              value={formData.birthday}
              onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium dark:text-gray-300">
              Gender
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="avatar_upload" className="block text-sm font-medium dark:text-gray-300">
            Avatar (128x128 - 200x200)
          </label>
          {formData.avatar_data && (
            <img
              src={formData.avatar_data}
              alt="Avatar preview"
              className="mt-2 h-20 w-20 rounded-full object-cover"
            />
          )}
          <input
            type="file"
            id="avatar_upload"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
