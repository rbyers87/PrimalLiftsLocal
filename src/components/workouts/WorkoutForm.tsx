import React, { useState, useEffect } from "react";
import { storage } from '../../lib/storage';
import { useAuth } from "../../contexts/AuthContext";
import { useExercises } from "../../hooks/useExercises";
import type { Exercise } from "../../types/workout";
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';

interface WorkoutFormProps {
  onClose: () => void;
  onCreate?: (workout: any) => void;
  workout?: {
    id: string;
    name: string;
    description: string;
    type: string;
    is_wod: boolean;
    scheduled_date: string;
    exercises: {
      id: string;
      exercise_id: string;
      sets: number;
      reps: number;
      weight: number;
      distance?: number;
      time?: number;
    }[];
  };
}

export function WorkoutForm({ onClose, onCreate, workout }: WorkoutFormProps) {
  const { user } = useAuth();
  const { exercises, loading, error: exercisesError } = useExercises();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "weight training",
    is_wod: false,
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    exercises: [] as any[],
  });

  useEffect(() => {
    if (workout) {
      setFormData({
        name: workout.name || "",
        description: workout.description || "",
        type: workout.type || "weight training",
        is_wod: workout.is_wod || false,
        scheduled_date: workout.scheduled_date ? format(parseISO(workout.scheduled_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        exercises: workout.exercises || [],
      });
    }
  }, [workout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      let workoutId: string;

      if (workout) {
        // Update existing workout
        await storage.workouts.update(workout.id, {
          name: formData.name,
          description: formData.description,
          type: formData.type,
          is_wod: formData.is_wod,
          scheduled_date: formData.scheduled_date,
        });
        workoutId = workout.id;

        // Delete existing exercises for this workout
        await storage.workoutExercises.deleteByWorkout(workoutId);
      } else {
        // Create new workout
        const newWorkout = await storage.workouts.add({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          is_wod: formData.is_wod,
          scheduled_date: formData.scheduled_date,
        });
        workoutId = newWorkout.id;

        if (onCreate) {
          onCreate(newWorkout);
        }
      }

      // Insert workout exercises
      const exercisesToInsert = formData.exercises.map((exercise, index) => ({
        workout_id: workoutId,
        exercise_id: exercise.exercise_id,
        sets: exercise.sets || 0,
        reps: exercise.reps || 0,
        weight: exercise.weight || 0,
        distance: exercise.distance || 0,
        time: exercise.time || 0,
        notes: '',
      }));

      if (exercisesToInsert.length > 0) {
        for (const exercise of exercisesToInsert) {
          await storage.workoutExercises.add(exercise);
        }
      }

      onClose();
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleExerciseChange = (index: number, field: string, value: string | number) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value,
    };
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { 
        id: uuidv4(), 
        exercise_id: "", 
        sets: 3, 
        reps: 10, 
        weight: 0 
      }],
    });
  };

  const removeExercise = (index: number) => {
    const updatedExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: updatedExercises });
  };

  if (loading) return <div className="p-4 text-center">Loading exercises...</div>;
  if (exercisesError) return <div className="p-4 text-center text-red-500">Error loading exercises: {exercisesError}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="weight training">Weight Training</option>
            <option value="cardio">Cardio</option>
            <option value="metcon">Metcon</option>
          </select>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_wod"
            checked={formData.is_wod}
            onChange={handleInputChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label className="ml-2 block text-sm font-medium dark:text-gray-300">
            Is Workout of the Day
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Schedule Date</label>
          <input
            type="date"
            name="scheduled_date"
            value={formData.scheduled_date}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium dark:text-gray-300">Exercises</label>
          {formData.exercises?.map((exercise, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <select
                value={exercise.exercise_id}
                onChange={(e) => handleExerciseChange(index, "exercise_id", e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Select exercise</option>
                {exercises.map((ex: Exercise) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeExercise(index)}
                className="text-red-500 text-sm font-medium hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addExercise}
            className="mt-2 text-indigo-600 font-medium hover:text-indigo-800"
          >
            + Add Exercise
          </button>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}
