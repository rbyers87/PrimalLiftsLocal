import { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import { useAuth } from '../contexts/AuthContext';

interface WorkoutStats {
  personalRecords: number;
  totalWorkouts: number;
  currentStreak: number;
}

export function useWorkoutStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<WorkoutStats>({
    personalRecords: 0,
    totalWorkouts: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get all workout logs for the user
        const logs = await storage.workoutLogs.getByUser(user.id);
        const totalWorkouts = logs.length;

        // Calculate personal records (exercises with max weight)
        // This is a simplified version - you might want to track PRs differently
        let prCount = 0;
        const exerciseMaxMap = new Map();

        for (const log of logs) {
          const exercises = await storage.workoutLogExercises.getByLog(log.id);
          for (const exercise of exercises) {
            const key = exercise.exercise_id;
            const currentMax = exerciseMaxMap.get(key) || 0;
            if (exercise.weight > currentMax) {
              exerciseMaxMap.set(key, exercise.weight);
            }
          }
        }

        // Count how many exercises have PRs (just a simple count)
        prCount = exerciseMaxMap.size;

        // Calculate streak
        let streak = 0;
        if (logs.length > 0) {
          // Sort logs by date (newest first)
          const sortedLogs = logs.sort((a, b) => 
            new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
          );

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          let currentDate = new Date(today);
          let foundWorkoutToday = false;

          for (const log of sortedLogs) {
            const logDate = new Date(log.completed_at);
            logDate.setHours(0, 0, 0, 0);
            
            const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
              foundWorkoutToday = true;
              streak++;
              currentDate = new Date(logDate);
            } else if (diffDays === 1 && foundWorkoutToday) {
              streak++;
              currentDate = new Date(logDate);
              foundWorkoutToday = true;
            } else if (diffDays === streak) {
              streak++;
              currentDate = new Date(logDate);
            } else {
              break;
            }
          }

          // If no workout today, check if there was one yesterday
          if (!foundWorkoutToday) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            streak = 0;
            
            for (const log of sortedLogs) {
              const logDate = new Date(log.completed_at);
              logDate.setHours(0, 0, 0, 0);
              
              if (logDate.getTime() === yesterday.getTime()) {
                streak = 1;
                break;
              }
            }
          }
        }

        setStats({
          personalRecords: prCount,
          totalWorkouts,
          currentStreak: streak,
        });
      } catch (error) {
        console.error('Error fetching workout stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  return { stats, loading };
}
