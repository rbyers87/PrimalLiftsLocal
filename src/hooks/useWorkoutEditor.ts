import { useState } from "react";
import { storage } from '../lib/storage';  // Fixed path
import { v4 as uuidv4 } from "uuid";
import type { Workout } from "../types/workout";

export interface WorkoutExerciseFormData {
  id?: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface WorkoutFormData {
  name: string;
  description: string;
  type: string;
  is_wod: boolean;
  scheduled_date: string;
  exercises: WorkoutExerciseFormData[];
  deletedExerciseIds: string[]; // Track deleted exercise IDs
}

export function useWorkoutEditor(workout: Workout, onClose: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [formData, setFormData] = useState<WorkoutFormData>({
    name: workout.name,
    description: workout.description || "",
    type: workout.type,
    is_wod: workout.is_wod,
    scheduled_date: workout.scheduled_date || new Date().toISOString().split("T")[0],
    exercises: workout.workout_exercises?.map((exercise) => ({
      id: exercise.id,
      exercise_id: exercise.exercise_id,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight || 0,
    })) || [],
    deletedExerciseIds: [],
  });

  const handleChange = (field: keyof WorkoutFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExerciseChange = (
    index: number,
    field: keyof WorkoutExerciseFormData,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) =>
        i === index ? { ...exercise, [field]: value } : exercise
      ),
    }));
  };

  const addExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { id: uuidv4(), exercise_id: "", sets: 0, reps: 0, weight: 0 },
      ],
    }));
  };

  const removeExercise = (index: number) => {
    setFormData((prev) => {
      const exercise = prev.exercises[index];
      const newDeletedIds = exercise.id 
        ? [...prev.deletedExerciseIds, exercise.id]
        : prev.deletedExerciseIds;

      return {
        ...prev,
        exercises: prev.exercises.filter((_, i) => i !== index),
        deletedExerciseIds: newDeletedIds,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Update workout details
      await storage.workouts.update(workout.id, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        is_wod: formData.is_wod,
        scheduled_date: formData.scheduled_date,
      });

      // Delete removed exercises
      if (formData.deletedExerciseIds.length > 0) {
        for (const exerciseId of formData.deletedExerciseIds) {
          await storage.workoutExercises.delete(exerciseId);
        }
      }

      // Get existing exercises for this workout
      const existingExercises = await storage.workoutExercises.getByWorkout(workout.id);
      const existingIds = new Set(existingExercises.map(e => e.id));

      // Update existing exercises and insert new ones
      for (const exercise of formData.exercises) {
        if (exercise.id && existingIds.has(exercise.id)) {
          // Update existing exercise
          await storage.workoutExercises.update(exercise.id, {
            exercise_id: exercise.exercise_id,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
          });
        } else if (exercise.id) {
          // New exercise - check if it exists in storage
          const existing = await storage.workoutExercises.get(exercise.id);
          if (!existing) {
            // Add new exercise
            await storage.workoutExercises.add({
              workout_id: workout.id,
              exercise_id: exercise.exercise_id,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              notes: '',
            });
          } else {
            // Update existing
            await storage.workoutExercises.update(exercise.id, {
              exercise_id: exercise.exercise_id,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
            });
          }
        }
      }

      onClose();
    } catch (err: any) {
      console.error("Error updating workout:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    handleChange,
    handleExerciseChange,
    handleSubmit,
    addExercise,
    removeExercise,
  };
}
