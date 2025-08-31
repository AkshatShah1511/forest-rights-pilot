import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'officer';
  name: string;
}

interface Profile {
  role: 'admin' | 'officer';
  email: string;
  full_name: string;
}

export type UserRole = 'admin' | 'officer' | null;

export function useUserRole() {
  const { user, profile, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const role = profile?.role || null;
  const isAdmin = role === 'admin';
  const isOfficer = role === 'officer';
  const isAuthenticated = !!user;

  const updateUserRole = async (newRole: UserRole) => {
    // In a real app, this would update the database
    // For demo purposes, we'll just update localStorage
    if (user) {
      const updatedUser = { ...user, role: newRole };
      localStorage.setItem('fra-atlas-user', JSON.stringify(updatedUser));
      // Force a page reload to update the state
      window.location.reload();
    }
  };

  return {
    user,
    role,
    profile,
    loading,
    error,
    isAdmin,
    isOfficer,
    isAuthenticated,
    updateUserRole
  };
}

// Hook for role-based component rendering
export function useRoleGuard(requiredRole: UserRole) {
  const { role, loading } = useUserRole();
  
  const hasAccess = !loading && role === requiredRole;
  
  return { hasAccess, loading };
}

// Hook for admin-only features
export function useAdminGuard() {
  return useRoleGuard('admin');
}

// Hook for officer-only features
export function useOfficerGuard() {
  return useRoleGuard('officer');
}

// Hook for authenticated users
export function useAuthGuard() {
  const { isAuthenticated, loading } = useUserRole();
  
  return { isAuthenticated, loading };
}
