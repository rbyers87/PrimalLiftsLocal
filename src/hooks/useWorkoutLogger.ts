import { useState } from 'react';
import { storage } from '../lib/storage';  // Fixed path
import { useAuth } from '../contexts/AuthContext';
import type { Workout } from '../types/workout';

interface LoggedSet {
  id?: string;
  weight: number | null;
  reps: number;
  distance?: number;
  time?: string | number | null;
  calories?: number;
}

interface ExerciseLog {
  exercise_id: string;
  sets: LoggedSet[];
}

export function useWorkoutLogger() {
  const { user } = useAuth();
  const [logging, setLogging] = useState(false);

  const startWorkoutLogging = async (workout: Workout) => {
    if (!user) {
      throw new Error('User must be logged in to start a workout');
    }

    setLogging(true);

    // Initialize exercise logs based on workout exercises
    const initialLogs: ExerciseLog[] = workout.workout_exercises?.map((exercise) => ({
      exercise_id: exercise.exercise_id,
      sets: Array(exercise.sets).fill({
        weight: exercise.weight || 0,
        reps: exercise.reps,
        distance: exercise.distance,
        time: exercise.time,
        calories: exercise.calories,
      }),
    })) || [];

    return initialLogs;
  };

  const calculateTotalScore = (logs: ExerciseLog[], workout: Workout) => {
    return logs.reduce((total, log, index) => {
      const exercise = workout.workout_exercises?.[index];
      if (!exercise) return total;
      
      if (exercise.exercise?.name === 'Run') {
        // Score for Run is based on total distance
        return total + log.sets.reduce((setTotal, set) => setTotal + (set.distance || 0), 0);
      } else if (exercise.exercise?.name === 'Assault Bike') {
        // Score for Assault Bike is based on total calories
        return total + log.sets.reduce((setTotal, set) => setTotal + (set.calories || 0), 0);
      } else if (workout.type === 'weight training') {
        // Score for weight training is based on weight * reps
        return total + log.sets.reduce((setTotal, set) => {
          return setTotal + ((set.weight || 0) * set.reps);
        }, 0);
      } else {
        // Default scoring
        return total + log.sets.reduce((setTotal, set) => {
          return setTotal + ((set.weight || 0) * set.reps);
        }, 0);
      }
    }, 0);
  };

  const logWorkout = async (
    workout: Workout,
    logs: ExerciseLog[],
    notes: string = ''
  ) => {
    if (!user) {
      throw new Error('User must be logged in to log a workout');
    }

    setLogging(true);

    try {
      // Calculate total score
      const totalScore = calculateTotalScore(logs, workout);

      // Create workout log
      const workoutLog = await storage.workoutLogs.add({
        workout_id: workout.id,
        user_id: user.id,
        notes,
        total_score: totalScore,
        completed_at: new Date().toISOString(),
        workout_name: workout.name,
      });

      // Create exercise scores
      const exerciseScores = logs.flatMap((log) =>
        log.sets.map((set) => ({
          log_id: workoutLog.id,
          exercise_id: log.exercise_id,
          weight: set.weight || 0,
          reps: set.reps,
          distance: set.distance,
          time: set.time ? String(set.time) : '',
          notes: '',
          exercise_name: '', // Will be filled in by the component
        }))
      );

      await storage.workoutLogExercises.addBulk(exerciseScores);

      return workoutLog;
    } catch (error) {
      console.error('Error logging workout:', error);
      throw error;
    } finally {
      setLogging(false);
    }
  };

  const updateWorkoutLog = async (
    workoutLogId: string,
    workout: Workout,
    logs: ExerciseLog[],
    notes: string = ''
  ) => {
    if (!user) {
      throw new Error('User must be logged in to update a workout');
    }

    setLogging(true);

    try {
      // Calculate total score
      const totalScore = calculateTotalScore(logs, workout);

      // Update the workout log
      await storage.workoutLogs.add({
        workout_id: workout.id,
        user_id: user.id,
        notes,
        total_score: totalScore,
        completed_at: new Date().toISOString(),
        workout_name: workout.name,
      });

      // Delete old exercise scores
      await storage.workoutLogExercises.deleteByLog(workoutLogId);

      // Create new exercise scores
      const exerciseScores = logs.flatMap((log) =>
        log.sets.map((set) => ({
          log_id: workoutLogId,
          exercise_id: log.exercise_id,
          weight: set.weight || 0,
          reps: set.reps,
          distance: set.distance,
          time: set.time ? String(set.time) : '',
          notes: '',
          exercise_name: '',
        }))
      );

      await storage.workoutLogExercises.addBulk(exerciseScores);

      return { id: workoutLogId };
    } catch (error) {
      console.error('Error updating workout log:', error);
      throw error;
    } finally {
      setLogging(false);
    }
  };

  return {
    logging,
    startWorkoutLogging,
    logWorkout,
    updateWorkoutLog,
  };
}
