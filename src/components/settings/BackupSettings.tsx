import React, { useState } from 'react';
import { exportDatabase, importDatabase } from '../../lib/database';
import { Download, Upload, AlertCircle } from 'lucide-react';

export function BackupSettings() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await exportDatabase();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `primal-lifts-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('Backup exported successfully!');
    } catch (error) {
      console.error('Error exporting database:', error);
      setMessage('Error exporting backup');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');

    try {
      const text = await file.text();
      await importDatabase(text);
      setMessage('Backup imported successfully! Refreshing page...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error importing database:', error);
      setMessage('Error importing backup. Please check the file format.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
      <h2 className="text-xl font-bold dark:text-gray-100 mb-4">Backup & Restore</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center space-x-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>Export Backup</span>
          </button>
          
          <label className="flex items-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={loading}
              className="hidden"
            />
          </label>
        </div>

        {message && (
          <div className={`flex items-center space-x-2 p-3 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            <AlertCircle className="h-4 w-4" />
            <span>{message}</span>
          </div>
        )}

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Export all your data including workouts, exercises, and settings as a JSON backup file.</p>
          <p className="mt-1">Import a previously exported backup to restore your data.</p>
          <p className="mt-1 text-yellow-600 dark:text-yellow-400">⚠️ Importing will overwrite all current data.</p>
        </div>
      </div>
    </div>
  );
}
