import Dexie, { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  profile_name: string;
  email: string;
  birthday: string;
  gender: string;
  avatar_url: string;
  avatar_data?: string; // base64 image data
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
  exercise?: Exercise;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  is_wod: boolean;
  scheduled_date: string;
  created_at: string;
  updated_at: string;
  workout_exercises?: WorkoutExercise[];
}

export interface WorkoutLog {
  id: string;
  workout_id: string;
  user_id: string;
  completed_at: string;
  notes: string;
  total_score: number;
  workout_name?: string;
}

export interface WorkoutLogExercise {
  id: string;
  log_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
  exercise_name?: string;
}

export interface AppSetting {
  key: string;
  value: string;
}

export interface Message {
  id: string;
  user_id: string;
  content: string;
  profile_name: string;
  created_at: string;
}

export interface UserPreference {
  user_id: string;
  notification_settings: string;
}

export class PrimalLiftsDatabase extends Dexie {
  profiles!: Table<Profile, string>;
  exercises!: Table<Exercise, string>;
  workouts!: Table<Workout, string>;
  workout_exercises!: Table<WorkoutExercise, string>;
  workout_logs!: Table<WorkoutLog, string>;
  workout_log_exercises!: Table<WorkoutLogExercise, string>;
  app_settings!: Table<AppSetting, string>;
  messages!: Table<Message, string>;
  user_preferences!: Table<UserPreference, string>;

  constructor() {
    super('PrimalLiftsDB');
    
    this.version(1).stores({
      profiles: 'id, email, profile_name',
      exercises: 'id, name, category',
      workouts: 'id, is_wod, scheduled_date',
      workout_exercises: 'id, workout_id, exercise_id',
      workout_logs: 'id, workout_id, user_id, completed_at',
      workout_log_exercises: 'id, log_id, exercise_id',
      app_settings: 'key',
      messages: 'id, user_id, created_at',
      user_preferences: 'user_id'
    });
  }
}

// Singleton instance
export const db = new PrimalLiftsDatabase();

// Initialize default data
export async function initializeDatabase() {
  try {
    // Check if we already have settings
    const settings = await db.app_settings.toArray();
    if (settings.length === 0) {
      // Add default welcome image (placeholder)
      await db.app_settings.add({
        key: 'welcome_image_url',
        value: '/PrimalLiftsLocal/icons/placeholder-welcome.jpg'
    });
      
      // Add default exercises if none exist
      const exercises = await db.exercises.toArray();
      if (exercises.length === 0) {
        const defaultExercises = [
          { id: uuidv4(), name: 'Bench Press', description: 'Chest press on flat bench', category: 'weight training', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: uuidv4(), name: 'Squat', description: 'Barbell squat', category: 'weight training', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: uuidv4(), name: 'Deadlift', description: 'Barbell deadlift', category: 'weight training', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: uuidv4(), name: 'Overhead Press', description: 'Barbell overhead press', category: 'weight training', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: uuidv4(), name: 'Pull-up', description: 'Bodyweight pull-up', category: 'weight training', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: uuidv4(), name: 'Running', description: 'Cardio running', category: 'cardio', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: uuidv4(), name: 'Rowing', description: 'Cardio rowing', category: 'cardio', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: uuidv4(), name: 'Metcon WOD', description: 'Metabolic conditioning workout', category: 'metcon', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ];
        await db.exercises.bulkAdd(defaultExercises);
      }
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Export/Import functions
export async function exportDatabase() {
  const data = {
    profiles: await db.profiles.toArray(),
    exercises: await db.exercises.toArray(),
    workouts: await db.workouts.toArray(),
    workout_exercises: await db.workout_exercises.toArray(),
    workout_logs: await db.workout_logs.toArray(),
    workout_log_exercises: await db.workout_log_exercises.toArray(),
    app_settings: await db.app_settings.toArray(),
    messages: await db.messages.toArray(),
    user_preferences: await db.user_preferences.toArray(),
    export_date: new Date().toISOString(),
    version: '1.0'
  };
  return JSON.stringify(data, null, 2);
}

export async function importDatabase(jsonData: string) {
  const data = JSON.parse(jsonData);
  
  // Clear existing data
  await db.profiles.clear();
  await db.exercises.clear();
  await db.workouts.clear();
  await db.workout_exercises.clear();
  await db.workout_logs.clear();
  await db.workout_log_exercises.clear();
  await db.app_settings.clear();
  await db.messages.clear();
  await db.user_preferences.clear();
  
  // Import new data
  if (data.profiles) await db.profiles.bulkAdd(data.profiles);
  if (data.exercises) await db.exercises.bulkAdd(data.exercises);
  if (data.workouts) await db.workouts.bulkAdd(data.workouts);
  if (data.workout_exercises) await db.workout_exercises.bulkAdd(data.workout_exercises);
  if (data.workout_logs) await db.workout_logs.bulkAdd(data.workout_logs);
  if (data.workout_log_exercises) await db.workout_log_exercises.bulkAdd(data.workout_log_exercises);
  if (data.app_settings) await db.app_settings.bulkAdd(data.app_settings);
  if (data.messages) await db.messages.bulkAdd(data.messages);
  if (data.user_preferences) await db.user_preferences.bulkAdd(data.user_preferences);
}
