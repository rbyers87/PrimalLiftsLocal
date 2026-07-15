import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { ExercisePercentages } from './ExercisePercentages';
import type { Workout, WorkoutExercise, ExerciseScore } from '../../types/workout';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface WorkoutLoggerProps {
  workout: Workout;
  onClose: (completedExercises?: any[]) => void;
  previousLogs?: any[];
  workoutLogId?: string | null;
  isCompleted?: boolean;
}

interface ExerciseLog {
  exercise_id: string;
  sets: Array<{
    id?: string;
    weight: number;
    reps: number;
    distance?: number;
    time?: string | number | null;
    calories?: number;
  }>;
}

export function WorkoutLogger({ workout, onClose, previousLogs, workoutLogId: initialWorkoutLogId, isCompleted }: WorkoutLoggerProps) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(initialWorkoutLogId);
  const [existingScores, setExistingScores] = useState<ExerciseScore[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;

      let initialLogs: ExerciseLog[] = [];
      let fetchedExistingScores: ExerciseScore[] = [];

      if (initialWorkoutLogId) {
        setWorkoutLogId(initialWorkoutLogId);
        try {
          // Get existing exercise scores from local storage
          const scores = await storage.workoutLogExercises.getByLog(initialWorkoutLogId);
          fetchedExistingScores = scores.map(score => ({
            id: score.id,
            exercise_id: score.exercise_id,
            workout_log_id: initialWorkoutLogId,
            user_id: user.id,
            weight: score.weight,
            reps: score.reps,
            distance: score.distance,
            time: score.time,
            calories: score.calories,
          }));
        } catch (error) {
          console.error('Error fetching previous exercise scores:', error);
        }
      } else if (previousLogs && previousLogs.length > 0) {
        const lastLog = previousLogs[0];
        setNotes(lastLog.notes || '');
        setWorkoutLogId(lastLog.id);
        try {
          const scores = await storage.workoutLogExercises.getByLog(lastLog.id);
          fetchedExistingScores = scores.map(score => ({
            id: score.id,
            exercise_id: score.exercise_id,
            workout_log_id: lastLog.id,
            user_id: user.id,
            weight: score.weight,
            reps: score.reps,
            distance: score.distance,
            time: score.time,
            calories: score.calories,
          }));
        } catch (error) {
          console.error('Error fetching previous exercise scores:', error);
        }
      }

      initialLogs = workout.workout_exercises?.map((exercise) => {
        const exerciseScores = fetchedExistingScores.filter((score) => score.exercise_id === exercise.exercise_id);
        const sets = exerciseScores.map((score) => ({
          id: score.id,
          weight: score.weight || 0,
          reps: score.reps,
          distance: score.distance,
          time: formatTime(score.time),
          calories: score.calories,
        }));

        if (sets.length === 0) {
          return {
            exercise_id: exercise.exercise_id,
            sets: Array(exercise.sets).fill({
              weight: 0,
              reps: exercise.reps,
              distance: exercise.distance,
              time: formatTime(exercise.time),
              calories: exercise.calories,
            }),
          };
        }

        return {
          exercise_id: exercise.exercise_id,
          sets: sets,
        };
      }) || [];

      setLogs(initialLogs);
      setExistingScores(fetchedExistingScores);
    };

    fetchInitialData();
  }, [previousLogs, workout, user, initialWorkoutLogId]);

  const formatTime = (time: string | number | null): string => {
    if (time == null) return '00:00';
    if (typeof time === 'number') {
      const mins = Math.floor(time);
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${String(hours).padStart(2, '0')}:${String(remainingMins).padStart(2, '0')}`;
    }
    return time;
  };

  const parseTime = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps' | 'distance' | 'time' | 'calories',
    value: any
  ) => {
    setLogs((prevLogs) => {
      const newLogs = [...prevLogs];
      newLogs[exerciseIndex].sets[setIndex] = {
        ...newLogs[exerciseIndex].sets[setIndex],
        [field]: field === 'time' ? value : Number(value),
      };
      return newLogs;
    });
  };

  const handleAddSet = (exerciseIndex: number) => {
    setLogs((prevLogs) => {
      const newLogs = [...prevLogs];
      const exercise = workout.workout_exercises?.[exerciseIndex];
      if (exercise) {
        newLogs[exerciseIndex] = {
          ...newLogs[exerciseIndex],
          sets: [...newLogs[exerciseIndex].sets, {
            id: uuidv4(),
            weight: 0,
            reps: exercise.reps,
            distance: exercise.distance,
            time: formatTime(exercise.time),
            calories: exercise.calories,
          }]
        };
      }
      return newLogs;
    });
  };

  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    setLogs((prevLogs) => {
      const newLogs = [...prevLogs];
      newLogs[exerciseIndex].sets = newLogs[exerciseIndex].sets.filter((_, i) => i !== setIndex);
      return newLogs;
    });
  };

  const calculateScore = (exercise: WorkoutExercise, log: ExerciseLog, workoutType: string) => {
    if (exercise.exercise?.name === 'Run') {
      return log.sets.reduce((total, set) => total + (set.distance || 0), 0);
    } else if (exercise.exercise?.name === 'Assault Bike') {
      return log.sets.reduce((total, set) => total + (set.calories || 0), 0);
    } else if (workoutType === 'weight training') {
      let maxWeight = 0;
      log.sets.forEach(set => {
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
        }
      });
      return maxWeight;
    } else {
      let maxWeight = 0;
      log.sets.forEach(set => {
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
        }
      });
      return maxWeight;
    }
  };

  const calculateTotal = (exercise: WorkoutExercise, log: ExerciseLog) => {
    if (exercise.exercise?.name === 'Run') {
      return log.sets.reduce((total, set) => {
        return total + (set.distance || 0);
      }, 0);
    } else if (exercise.exercise?.name === 'Assault Bike') {
      return log.sets.reduce((total, set) => {
        return total + (set.calories || 0);
      }, 0);
    } else {
      return log.sets.reduce(
        (total, set) => total + set.weight * set.reps,
        0
      );
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('User is not logged in.');
      return;
    }

    setSaving(true);

    try {
      // Calculate the total score and total for the workout
      const score = logs.reduce((total, log, index) => {
        const exercise = workout.workout_exercises?.[index];
        return total + (exercise ? calculateScore(exercise, log, workout.type) : 0);
      }, 0);

      const total = logs.reduce((total, log, index) => {
        const exercise = workout.workout_exercises?.[index];
        return total + (exercise ? calculateTotal(exercise, log) : 0);
      }, 0);

      let currentWorkoutLogId = workoutLogId;

      if (currentWorkoutLogId) {
        // Update existing workout log
        await storage.workoutLogs.add({
          workout_id: workout.id,
          user_id: user.id,
          notes,
          total_score: score,
          completed_at: new Date().toISOString(),
          workout_name: workout.name,
        });
      } else {
        // Create new workout log
        const newLog = await storage.workoutLogs.add({
          workout_id: workout.id,
          user_id: user.id,
          notes,
          total_score: score,
          completed_at: new Date().toISOString(),
          workout_name: workout.name,
        });
        currentWorkoutLogId = newLog.id;
        setWorkoutLogId(currentWorkoutLogId);
      }

      // Delete old exercise scores if updating
      if (currentWorkoutLogId) {
        await storage.workoutLogExercises.deleteByLog(currentWorkoutLogId);
      }

      // Prepare exercise scores for insertion
      const exerciseScoresToInsert = logs.flatMap((log, index) => {
        const exercise = workout.workout_exercises?.[index];
        if (!exercise) return [];
        return log.sets.map((set) => ({
          log_id: currentWorkoutLogId!,
          exercise_id: log.exercise_id,
          weight: set.weight || 0,
          reps: set.reps,
          distance: set.distance,
          time: set.time ? String(set.time) : '',
          notes: '',
          exercise_name: exercise.exercise?.name || '',
        }));
      });

      if (exerciseScoresToInsert.length > 0) {
        await storage.workoutLogExercises.addBulk(exerciseScoresToInsert);
      }

      // Get completed exercises for the week
      if (user) {
        const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

        // Get all logs for the user
        const allLogs = await storage.workoutLogs.getByUser(user.id);
        
        // Filter logs within the week
        const weekLogs = allLogs.filter(log => {
          const logDate = log.completed_at.split('T')[0];
          return logDate >= weekStart && logDate <= weekEnd;
        });

        const formattedCompletedExercises: any[] = [];
        for (const log of weekLogs) {
          const exercises = await storage.workoutLogExercises.getByLog(log.id);
          for (const ex of exercises) {
            formattedCompletedExercises.push({
              exercise_id: ex.exercise_id,
              completed_at: log.completed_at,
            });
          }
        }

        onClose(formattedCompletedExercises);
      } else {
        onClose();
      }

      alert('Workout logged successfully!');
    } catch (error) {
      console.error('Error logging workout:', error);
      alert(`Failed to log workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 dark:bg-gray-800 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 ai-style-change-1 dark:bg-gray-700 dark:text-gray-300 dark:shadow-gray-900">
        <h2 className="text-2xl font-bold dark:text-gray-100 mb-6">
          Log Workout: {workout.name}
        </h2>

        <div className="space-y-6">
          {workout.workout_exercises?.map((exercise, exerciseIndex) => (
            <div key={exercise.id} className="border rounded-md p-4">
              <h3 className="font-medium text-lg mb-3">
                {exercise.exercise?.name}
              </h3>

              <ExercisePercentages 
                exerciseId={exercise.exercise_id}
                exerciseName={exercise.exercise?.name || ''}
              />

              <div className="space-y-3 mt-4">
                {Array.from({ length: logs[exerciseIndex]?.sets?.length || 0 }).map((_, setIndex) => (
                  <div key={setIndex} className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-sm text-gray-500">
                      Set {setIndex + 1}
                    </div>
                    {exercise.exercise?.name === 'Run' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-300">Time (HH:MM)</label>
                          <input
                            type="text"
                            value={logs[exerciseIndex]?.sets[setIndex]?.time || '00:00'}
                            onChange={(e) =>
                              handleSetChange(exerciseIndex, setIndex, 'time', e.target.value)
                            }
                            className="w-full rounded-md border-gray-300 dark:bg-gray-600 dark:text-gray-100"
                            placeholder="HH:MM"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-300">Distance (meters)</label>
                          <input
                            type="number"
                            value={logs[exerciseIndex]?.sets[setIndex]?.distance || ''}
                            onChange={(e) =>
                              handleSetChange(
                                exerciseIndex,
                                setIndex,
                                'distance',
                                Number(e.target.value)
                              )
                            }
                            className="w-full rounded-md border-gray-300 dark:bg-gray-600 dark:text-gray-100"
                            placeholder="Distance (meters)"
                          />
                        </div>
                      </>
                    ) : exercise.exercise?.name === 'Assault Bike' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-300">Time (HH:MM)</label>
                          <input
                            type="text"
                            value={logs[exerciseIndex]?.sets[setIndex]?.time || '00:00'}
                            onChange={(e) =>
                              handleSetChange(exerciseIndex, setIndex, 'time', e.target.value)
                            }
                            className="w-full rounded-md border-gray-300 dark:bg-gray-600 dark:text-gray-100"
                            placeholder="HH:MM"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-300">Calories</label>
                          <input
                            type="number"
                            value={logs[exerciseIndex]?.sets[setIndex]?.calories || ''}
                            onChange={(e) =>
                              handleSetChange(
                                exerciseIndex,
                                setIndex,
                                'calories',
                                Number(e.target.value)
                              )
                            }
                            className="w-full rounded-md border-gray-300 dark:bg-gray-600 dark:text-gray-100"
                            placeholder="Calories"
                          />
                        </div>
                      </>
                    ) : exercise.exercise?.name === 'Rower' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-300">Distance (meters)</label>
                          <input
                            type="number"
                            value={logs[exerciseIndex]?.sets[setIndex]?.distance || ''}
                            onChange={(e) =>
                              handleSetChange(
                                exerciseIndex,
                                setIndex,
                                'distance',
                                Number(e.target.value)
                              )
                            }
                            className="w-full rounded-md border-gray-300 dark:bg-gray-600 dark:text-gray-100"
                            placeholder="Distance (meters)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-300">Calories</label>
                          <input
                            type="number"
                            value={logs[exerciseIndex]?.sets[setIndex]?.calories || ''}
                            onChange={(e) =>
                              handleSetChange(
                                exerciseIndex,
                                setIndex,
                                'calories',
                                Number(e.target.value)
                              )
                            }
                            className="w-full rounded-md border-gray-300 dark:bg-gray-600 dark:text-gray-100"
                            placeholder="Calories"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <input
                            type="number"
                            value={logs[exerciseIndex]?.sets[setIndex]?.weight || ''}
                            onChange={(e) =>
                              handleSetChange(
                                exerciseIndex,
                                setIndex,
                                'weight',
                                e.target.value ? Number(e.target.value) : 0
                              )
                            }
                            className="w-full rounded-md border-gray-300 dark:bg-gray-600 dark:text-gray-100"
                            placeholder="Weight"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={logs[exerciseIndex]?.sets[setIndex]?.reps || ''}
                            onChange={(e) =>
                              handleSetChange(
                                exerciseIndex,
                                setIndex,
                                'reps',
                                Number(e.target.value)
                              )
                            }
                            className="w-full rounded-md border-gray-300 dark:bg-gray-600 dark:text-gray-100"
                            placeholder="Reps"
                          />
                        </div>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddSet(exerciseIndex)}
                  className="mt-2 text-indigo-600 font-medium hover:underline"
                >
                  Add Set
                </button>
              </div>
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:bg-gray-600 dark:text-gray-100"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium dark:text-gray-300 hover:text-gray-500"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              disabled={saving}
            >
              {saving ? 'Saving...' : isCompleted ? 'Update Workout' : 'Complete Workout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
