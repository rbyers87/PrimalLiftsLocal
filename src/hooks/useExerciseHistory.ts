import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';  // Fixed path
import { useAuth } from '../contexts/AuthContext';

interface ExerciseHistory {
  maxWeight: number;
  percentages: {
    percentage: number;
    weight: number;
  }[];
}

export function useExerciseHistory(exerciseId: string) {
  const { user } = useAuth();
  const [history, setHistory] = useState<ExerciseHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user || !exerciseId) return;

      try {
        // Get all workout logs for the user
        const logs = await storage.workoutLogs.getByUser(user.id);
        let maxWeight = 0;

        // Check each log for the exercise
        for (const log of logs) {
          const exercises = await storage.workoutLogExercises.getByLog(log.id);
          const exerciseLog = exercises.find(e => e.exercise_id === exerciseId);
          
          if (exerciseLog && exerciseLog.weight > maxWeight) {
            maxWeight = exerciseLog.weight;
          }
        }

        if (maxWeight > 0) {
          const percentages = [100, 90, 80, 70, 60, 50].map(percentage => ({
            percentage,
            weight: Math.round((maxWeight * percentage) / 100 * 2) / 2 // Rounds to nearest 0.5
          }));

          setHistory({ maxWeight, percentages });
        }
      } catch (error) {
        console.error('Error fetching exercise history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user, exerciseId]);

  return { history, loading };
}
