import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import { Trash2 } from 'lucide-react';

export function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('');
  const [exerciseMessage, setExerciseMessage] = useState('');
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [selectedMessage, setSelectedMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageBoardMessage, setMessageBoardMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const exercisesData = await storage.exercises.getAll();
        setExercises(exercisesData || []);
        const messagesData = await storage.messages.getAll();
        setMessages(messagesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateExercise = async () => {
    setLoading(true);
    setExerciseMessage('');

    try {
      await storage.exercises.add({
        name: newExerciseName,
        description: newExerciseDescription,
        category: newExerciseCategory,
      });
      setExerciseMessage('Exercise created successfully');
      setNewExerciseName('');
      setNewExerciseDescription('');
      setNewExerciseCategory('');
      // Refresh exercises
      const data = await storage.exercises.getAll();
      setExercises(data || []);
    } catch (error) {
      console.error('Error creating exercise:', error);
      setExerciseMessage('Error creating exercise');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async () => {
    setLoading(true);
    setExerciseMessage('');

    try {
      await storage.exercises.delete(selectedExercise);
      setExerciseMessage('Exercise deleted successfully');
      // Refresh exercises
      const data = await storage.exercises.getAll();
      setExercises(data || []);
      setSelectedExercise('');
    } catch (error) {
      console.error('Error deleting exercise:', error);
      setExerciseMessage('Error deleting exercise');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async () => {
    setLoading(true);
    setMessageBoardMessage('');

    try {
      await storage.messages.delete(selectedMessage);
      setMessageBoardMessage('Message deleted successfully');
      const data = await storage.messages.getAll();
      setMessages(data || []);
      setSelectedMessage('');
    } catch (error) {
      console.error('Error deleting message:', error);
      setMessageBoardMessage('Error deleting message');
    } finally {
      setLoading(false);
    }
  };

  const handleClearMessageBoard = async () => {
    setLoading(true);
    setMessageBoardMessage('');

    try {
      await storage.messages.clearAll();
      setMessageBoardMessage('Message board cleared successfully');
      setMessages([]);
      setSelectedMessage('');
    } catch (error) {
      console.error('Error clearing message board:', error);
      setMessageBoardMessage('Error clearing message board');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = ['weight training', 'cardio', 'metcon'];

  return (
    <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
      <h2 className="text-xl font-bold dark:text-gray-100 mb-4">Admin Settings</h2>

      <div className="mt-8">
        <h3 className="text-lg font-medium dark:text-gray-100 mb-4">Create New Exercise</h3>
        <p className="text-sm text-gray-500 mb-4">
          Note: Exercise names are case-sensitive.
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="new_exercise_name" className="block text-sm font-medium dark:text-gray-300">
              Exercise Name
            </label>
            <input
              type="text"
              id="new_exercise_name"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="new_exercise_description" className="block text-sm font-medium dark:text-gray-300">
              Description
            </label>
            <textarea
              id="new_exercise_description"
              value={newExerciseDescription}
              onChange={(e) => setNewExerciseDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="new_exercise_category" className="block text-sm font-medium dark:text-gray-300">
              Category
            </label>
            <select
              id="new_exercise_category"
              value={newExerciseCategory}
              onChange={(e) => setNewExerciseCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select category</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreateExercise}
            disabled={loading}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Exercise'}
          </button>
          {exerciseMessage && (
            <p className={`mt-4 text-sm ${exerciseMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {exerciseMessage}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium dark:text-gray-100 mb-4">Current Exercises</h3>
        <div className="flex items-center space-x-2">
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Select an exercise to delete</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleDeleteExercise}
            disabled={loading || !selectedExercise}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium dark:text-gray-100 mb-4">Message Board Management</h3>
        <div className="flex items-center space-x-2">
          <select
            value={selectedMessage}
            onChange={(e) => setSelectedMessage(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Select a message to delete</option>
            {messages.map((message) => (
              <option key={message.id} value={message.id}>
                {message.content.length > 50 ? message.content.substring(0, 50) + '...' : message.content}
              </option>
            ))}
          </select>
          <button
            onClick={handleDeleteMessage}
            disabled={loading || !selectedMessage}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={handleClearMessageBoard}
          disabled={loading}
          className="mt-4 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Clear Message Board
        </button>
        {messageBoardMessage && (
          <p className={`mt-4 text-sm ${messageBoardMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {messageBoardMessage}
          </p>
        )}
      </div>
    </div>
  );
}
