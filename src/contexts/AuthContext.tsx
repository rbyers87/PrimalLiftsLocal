import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage, getCurrentUser } from '../lib/storage';
import { initializeDatabase } from '../lib/database';

interface AuthContextType {
  user: { id: string; email: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await initializeDatabase();
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    }
    init();
  }, []);

  const signUp = async (email: string, password: string) => {
    // Create local profile
    await storage.profile.update({
      email: email,
      profile_name: email.split('@')[0]
    });
    const userData = await getCurrentUser();
    setUser(userData);
  };

  const signIn = async (email: string, password: string) => {
    // Simple local authentication - just set the user
    const existingProfile = await storage.profile.get();
    if (!existingProfile) {
      await storage.profile.update({
        email: email,
        profile_name: email.split('@')[0]
      });
    } else {
      await storage.profile.update({
        email: email
      });
    }
    const userData = await getCurrentUser();
    setUser(userData);
  };

  const signOut = async () => {
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
