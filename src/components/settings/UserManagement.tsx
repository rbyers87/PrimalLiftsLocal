import React from 'react';
import { UserList } from './UserList';

export function UserManagement() {
  return (
    <div className="bg-white dark:bg-darkBackground dark:text-gray-100 dark:text-gray-200 rounded-lg shadow-md p-6 transition-all duration-300">
      <h2 className="text-xl font-bold dark:text-gray-100 mb-4">User Management</h2>
      <div className="space-y-6">
        <UserList />
      </div>
    </div>
  );
}
