import React, { useState, useEffect } from 'react';
import { storage, getCurrentUser } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Trash2 } from 'lucide-react';

interface Message {
  id: string;
  user_id: string;
  profile_name: string;
  content: string;
  created_at: string;
}

export default function MessageBoard() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      try {
        const data = await storage.messages.getAll();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  const handlePostMessage = async () => {
    if (!user) return;
    if (!newMessage.trim()) return;

    try {
      const profile = await storage.profile.get();
      const message = await storage.messages.add({
        user_id: user.id,
        content: newMessage,
        profile_name: profile?.profile_name || user.email || 'Anonymous'
      });

      setMessages(prevMessages => [message, ...prevMessages]);
      setNewMessage('');
    } catch (error) {
      console.error('Error posting message:', error);
      setError('Failed to post message. Please try again.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await storage.messages.delete(messageId);
      setMessages(prevMessages =>
        prevMessages.filter(message => message.id !== messageId)
      );
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 dark:text-gray-100">Message Board</h1>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-4">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a message..."
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200"
        />
        <button
          onClick={handlePostMessage}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Post Message
        </button>
      </div>

      <div>
        {messages.map((message) => (
          <div key={message.id} className="mb-4 p-4 rounded-md shadow-md dark:bg-gray-800 dark:text-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{message.profile_name}</h4>
                <p className="text-sm text-gray-500">{new Date(message.created_at).toLocaleDateString()}</p>
                <p className="mt-2">{message.content}</p>
              </div>
              {user?.id === message.user_id && (
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
