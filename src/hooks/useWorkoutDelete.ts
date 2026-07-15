import { useState } from 'react';
import { storage } from '../../lib/storage';

export function useWorkoutDelete() {
  const [deleting, setDeleting] = useState(false);

  const deleteWorkout = async (workoutId: string) => {
    setDeleting(true);
    try {
      // Delete the workout (this will also delete associated workout_exercises)
      await storage.workouts.delete(workoutId);
      return true;
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteWorkout, deleting };
}
