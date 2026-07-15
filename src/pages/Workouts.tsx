import React, { useState, useEffect } from "react";
import { WorkoutList } from "../components/workouts/WorkoutList";
import { WorkoutScheduler } from "../components/workouts/WorkoutScheduler";
import { WorkoutCreator } from "../components/workouts/WorkoutCreator";
import { storage } from '../lib/storage';

export default function Workouts() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Test connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const data = await storage.workouts.getAll();
        console.log("Fetched workouts:", data);
      } catch (err) {
        console.error("Error while querying storage:", err);
      }
    };

    testConnection();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const data = await storage.workouts.getAll();
      setWorkouts(data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading workouts...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-gray-100">Workouts</h1>
        <WorkoutCreator onWorkoutCreated={fetchWorkouts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <WorkoutList workouts={workouts} />
        </div>
        <div>
          <WorkoutScheduler />
        </div>
      </div>
    </div>
  );
}
