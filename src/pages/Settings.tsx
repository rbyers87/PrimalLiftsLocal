import React from 'react';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { UserManagement } from '../components/settings/UserManagement';
import { AdminSettings } from '../components/settings/AdminSettings';
import { WeeklyExercisesSettings } from '../components/settings/WeeklyExercisesSettings';
import { BackupSettings } from '../components/settings/BackupSettings';

export default function Settings() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold dark:text-gray-100">Settings</h1>
      
      <div className="space-y-6">
        <ProfileSettings />
        <SecuritySettings />
        <NotificationSettings />
        <UserManagement />
        <AdminSettings />
        <WeeklyExercisesSettings />
        <BackupSettings />
      </div>
    </div>
  );
}
