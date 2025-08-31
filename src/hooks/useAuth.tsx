import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'officer';
  name: string;
}

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'admin' | 'officer') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('fra-atlas-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setProfile({ role: userData.role, email: userData.email, full_name: userData.name });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Demo authentication
    const demoUsers = {
      'admin@fra-atlas.gov.in': { password: 'admin123', role: 'admin', name: 'System Administrator' },
      'officer@fra-atlas.gov.in': { password: 'officer123', role: 'officer', name: 'Field Officer' }
    };

    const userData = demoUsers[email as keyof typeof demoUsers];
    
    if (!userData || userData.password !== password) {
      return { error: { message: 'Invalid email or password' } };
    }

    const user: User = {
      id: `demo-${userData.role}-id`,
      email,
      role: userData.role,
      name: userData.name
    };

    setUser(user);
    setProfile({ role: user.role, email: user.email, full_name: user.name });
    localStorage.setItem('fra-atlas-user', JSON.stringify(user));
    
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'admin' | 'officer') => {
    // Demo signup - just create a local user
    const user: User = {
      id: `demo-${role}-${Date.now()}`,
      email,
      role,
      name: fullName
    };

    setUser(user);
    setProfile({ role: user.role, email: user.email, full_name: user.name });
    localStorage.setItem('fra-atlas-user', JSON.stringify(user));
    
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('fra-atlas-user');
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};