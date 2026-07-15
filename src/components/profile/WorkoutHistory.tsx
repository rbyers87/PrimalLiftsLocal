import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { storage } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';

interface WorkoutHistoryProps {
  exerciseId: string | null;
}

export function WorkoutHistory({ exerciseId }: WorkoutHistoryProps) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get all workout logs for the user
        const allLogs = await storage.workoutLogs.getByUser(user.id);
        
        // If an exercise is selected, filter logs that contain that exercise
        if (exerciseId) {
          const filteredLogs = [];
          for (const log of allLogs) {
            const exercises = await storage.workoutLogExercises.getByLog(log.id);
            const hasExercise = exercises.some(e => e.exercise_id === exerciseId);
            if (hasExercise) {
              filteredLogs.push({
                ...log,
                exercises: exercises
              });
            }
          }
          setLogs(filteredLogs);
        } else {
          // Get all logs with their exercises
          const logsWithExercises = [];
          for (const log of allLogs) {
            const exercises = await storage.workoutLogExercises.getByLog(log.id);
            logsWithExercises.push({
              ...log,
              exercises: exercises
            });
          }
          setLogs(logsWithExercises);
        }
      } catch (error) {
        console.error('Error fetching workout history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user, exerciseId]);

  const toggleExpand = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-darkBackground rounded-lg shadow-md p-6">
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading workout history...</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-darkBackground rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold dark:text-gray-100 mb-2">Workout History</h3>
        <p className="text-gray-500 dark:text-gray-400">
          {exerciseId ? 'No history for this exercise yet.' : 'No workout history yet. Complete a workout to see it here!'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-darkBackground rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold dark:text-gray-100 mb-4">Workout History</h3>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => toggleExpand(log.id)}
            >
              <div>
                <p className="font-medium dark:text-gray-100">
                  {log.workout_name || 'Workout'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(log.completed_at), 'PPP')}
                </p>
                {log.total_score > 0 && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    Score: {log.total_score}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {log.exercises?.length || 0} exercises
                </span>
                {expandedLog === log.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedLog === log.id && log.exercises && (
              <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="space-y-3">
                  {log.exercises.map((exercise: any) => (
                    <div key={exercise.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Dumbbell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="dark:text-gray-100">
                          {exercise.exercise_name || 'Exercise'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {exercise.sets} sets × {exercise.reps} reps
                        {exercise.weight > 0 && ` @ ${exercise.weight}lbs`}
                      </div>
                    </div>
                  ))}
                  {log.notes && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <p className="font-medium">Notes:</p>
                      <p>{log.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
