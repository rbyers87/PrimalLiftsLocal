import { db, type Profile, type Exercise, type Workout, type WorkoutExercise, type WorkoutLog, type WorkoutLogExercise, type AppSetting, type Message, type UserPreference } from './database';
import { v4 as uuidv4 } from 'uuid';

// Local storage service
export const storage = {
  // Profile methods
  profile: {
    get: async () => {
      const profiles = await db.profiles.toArray();
      return profiles[0] || null;
    },
    update: async (data: Partial<Profile>) => {
      const existing = await db.profiles.toArray();
      if (existing.length === 0) {
        const newProfile: Profile = {
          id: uuidv4(),
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          profile_name: data.profile_name || 'User',
          email: data.email || 'local@user.com',
          birthday: data.birthday || '',
          gender: data.gender || '',
          avatar_url: data.avatar_url || '',
          avatar_data: data.avatar_data || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await db.profiles.add(newProfile);
        return newProfile;
      } else {
        const id = existing[0].id;
        await db.profiles.update(id, {
          ...data,
          updated_at: new Date().toISOString()
        });
        return await db.profiles.get(id);
      }
    }
  },

  // Exercise methods
  exercises: {
    getAll: async () => {
      return await db.exercises.toArray();
    },
    get: async (id: string) => {
      return await db.exercises.get(id);
    },
    add: async (data: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>) => {
      const newExercise: Exercise = {
        id: uuidv4(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await db.exercises.add(newExercise);
      return newExercise;
    },
    update: async (id: string, data: Partial<Exercise>) => {
      await db.exercises.update(id, {
        ...data,
        updated_at: new Date().toISOString()
      });
      return await db.exercises.get(id);
    },
    delete: async (id: string) => {
      await db.exercises.delete(id);
    }
  },

  // Workout methods
  workouts: {
    getAll: async () => {
      return await db.workouts.toArray();
    },
    get: async (id: string) => {
      return await db.workouts.get(id);
    },
    getWithExercises: async (id: string) => {
      const workout = await db.workouts.get(id);
      if (!workout) return null;
      const workoutExercises = await db.workout_exercises.where('workout_id').equals(id).toArray();
      const exercises = await db.exercises.toArray();
      
      return {
        ...workout,
        workout_exercises: workoutExercises.map(we => ({
          ...we,
          exercise: exercises.find(e => e.id === we.exercise_id)
        }))
      };
    },
    getWOD: async (date: string) => {
      const workouts = await db.workouts.where({ is_wod: true, scheduled_date: date }).toArray();
      if (workouts.length === 0) return null;
      const workout = workouts[0];
      const workoutExercises = await db.workout_exercises.where('workout_id').equals(workout.id).toArray();
      const exercises = await db.exercises.toArray();
      
      return {
        ...workout,
        workout_exercises: workoutExercises.map(we => ({
          ...we,
          exercise: exercises.find(e => e.id === we.exercise_id)
        }))
      };
    },
    add: async (data: Omit<Workout, 'id' | 'created_at' | 'updated_at'>) => {
      const newWorkout: Workout = {
        id: uuidv4(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await db.workouts.add(newWorkout);
      return newWorkout;
    },
    update: async (id: string, data: Partial<Workout>) => {
      await db.workouts.update(id, {
        ...data,
        updated_at: new Date().toISOString()
      });
      return await db.workouts.get(id);
    },
    delete: async (id: string) => {
      // Delete associated exercises first
      await db.workout_exercises.where('workout_id').equals(id).delete();
      await db.workouts.delete(id);
    }
  },

  // WorkoutExercise methods
  workoutExercises: {
    getByWorkout: async (workoutId: string) => {
      return await db.workout_exercises.where('workout_id').equals(workoutId).toArray();
    },
    add: async (data: Omit<WorkoutExercise, 'id'>) => {
      const newWE: WorkoutExercise = {
        id: uuidv4(),
        ...data
      };
      await db.workout_exercises.add(newWE);
      return newWE;
    },
    update: async (id: string, data: Partial<WorkoutExercise>) => {
      await db.workout_exercises.update(id, data);
      return await db.workout_exercises.get(id);
    },
    delete: async (id: string) => {
      await db.workout_exercises.delete(id);
    },
    deleteByWorkout: async (workoutId: string) => {
      await db.workout_exercises.where('workout_id').equals(workoutId).delete();
    }
  },

  // WorkoutLog methods
  workoutLogs: {
    getAll: async () => {
      return await db.workout_logs.toArray();
    },
    getByUser: async (userId: string) => {
      return await db.workout_logs.where('user_id').equals(userId).toArray();
    },
    getByWorkout: async (workoutId: string, userId: string) => {
      return await db.workout_logs.where({ workout_id: workoutId, user_id: userId }).toArray();
    },
    getLatestByWorkout: async (workoutId: string, userId: string) => {
      const logs = await db.workout_logs.where({ workout_id: workoutId, user_id: userId })
        .sortBy('completed_at');
      return logs.length > 0 ? logs[logs.length - 1] : null;
    },
    add: async (data: Omit<WorkoutLog, 'id'>) => {
      const newLog: WorkoutLog = {
        id: uuidv4(),
        ...data
      };
      await db.workout_logs.add(newLog);
      return newLog;
    }
  },

  // WorkoutLogExercise methods
  workoutLogExercises: {
    getByLog: async (logId: string) => {
      return await db.workout_log_exercises.where('log_id').equals(logId).toArray();
    },
    add: async (data: Omit<WorkoutLogExercise, 'id'>) => {
      const newLE: WorkoutLogExercise = {
        id: uuidv4(),
        ...data
      };
      await db.workout_log_exercises.add(newLE);
      return newLE;
    },
    addBulk: async (items: Omit<WorkoutLogExercise, 'id'>[]) => {
      const newItems = items.map(item => ({
        id: uuidv4(),
        ...item
      }));
      await db.workout_log_exercises.bulkAdd(newItems);
      return newItems;
    },
    deleteByLog: async (logId: string) => {
      await db.workout_log_exercises.where('log_id').equals(logId).delete();
    }
  },

  // App settings
  settings: {
    get: async (key: string) => {
      const setting = await db.app_settings.get(key);
      return setting ? setting.value : null;
    },
    set: async (key: string, value: string) => {
      await db.app_settings.put({ key, value });
    }
  },

  // Messages
  messages: {
    getAll: async () => {
      return await db.messages.orderBy('created_at').reverse().toArray();
    },
    add: async (data: Omit<Message, 'id' | 'created_at'>) => {
      const newMessage: Message = {
        id: uuidv4(),
        ...data,
        created_at: new Date().toISOString()
      };
      await db.messages.add(newMessage);
      return newMessage;
    },
    delete: async (id: string) => {
      await db.messages.delete(id);
    },
    clearAll: async () => {
      await db.messages.clear();
    }
  },

  // User preferences
  preferences: {
    get: async (userId: string) => {
      return await db.user_preferences.get(userId);
    },
    set: async (userId: string, notification_settings: string) => {
      await db.user_preferences.put({ user_id: userId, notification_settings });
    }
  }
};

// Helper to get current user (always returns a default user)
export const getCurrentUser = async () => {
  const profile = await storage.profile.get();
  if (!profile) {
    return { id: 'local-user', email: 'local@user.com' };
  }
  return { id: 'local-user', email: profile.email || 'local@user.com' };
};
