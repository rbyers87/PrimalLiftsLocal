import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { WorkoutCard } from './WorkoutCard';
import { WorkoutCreator } from './WorkoutCreator';
import type { Workout } from '../../types/workout';

export function WorkoutList() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    try {
      const allWorkouts = await storage.workouts.getAll();
      
      // Get exercises for each workout
      const workoutsWithExercises = await Promise.all(
        allWorkouts.map(async (workout) => {
          const exercises = await storage.workoutExercises.getByWorkout(workout.id);
          const allExercises = await storage.exercises.getAll();
          
          return {
            ...workout,
            workout_exercises: exercises.map(we => ({
              ...we,
              exercise: allExercises.find(e => e.id === we.exercise_id)
            }))
          };
        })
      );
      
      // Sort by created_at (newest first)
      const sorted = workoutsWithExercises.sort((a, b) => 
        (b.created_at || '').localeCompare(a.created_at || '')
      );
      
      setWorkouts(sorted);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <WorkoutCreator onWorkoutCreated={fetchWorkouts} />
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          onDelete={fetchWorkouts}
        />
      ))}
    </div>
  );
}
