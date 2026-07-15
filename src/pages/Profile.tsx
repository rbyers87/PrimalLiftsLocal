import React, { useState, useEffect } from 'react';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
import { WorkoutHistory } from '../components/profile/WorkoutHistory';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ExercisePercentages } from '../components/workouts/ExercisePercentages';
import { storage } from '../lib/storage';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exercisesLoading, setExercisesLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const profileData = await storage.profile.get();
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchExercises() {
      setExercisesLoading(true);
      try {
        const data = await storage.exercises.getAll();
        setExercises(data || []);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setExercisesLoading(false);
      }
    }
    fetchExercises();
  }, []);

  if (loading || exercisesLoading) return <LoadingSpinner />;
  if (!profile) return null;

  return (
    <div className="space-y-8">
      <ProfileHeader profile={profile} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <label htmlFor="exerciseSelect" className="block text-sm font-medium dark:text-gray-300">
              Select Exercise
            </label>
            <select
              id="exerciseSelect"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              onChange={(e) => setSelectedExercise(e.target.value)}
              value={selectedExercise || ''}
            >
              <option value="">Select an exercise</option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </div>
          {selectedExercise && (
            <ExercisePercentages 
              exerciseId={selectedExercise} 
              exerciseName={exercises.find(ex => ex.id === selectedExercise)?.name || ''} 
            />
          )}
          <WorkoutHistory exerciseId={selectedExercise} />
        </div>
        <div>
          <ProfileStats />
        </div>
      </div>
    </div>
  );
}
