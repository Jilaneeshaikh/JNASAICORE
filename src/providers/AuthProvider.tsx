import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext, UserSession } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'jnas-auth-session';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { triggerToast } = useNotification();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from localStorage
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEY);
      if (savedSession) {
        setUser(JSON.parse(savedSession));
      }
    } catch (e) {
      console.error('Failed to load session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    // Simple validation for placeholder authentication
    if (email && password) {
      const mockUser: UserSession = {
        id: 'usr-4819',
        name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Chief Operator',
        email: email,
        role: 'Enterprise Admin',
        lastLogin: new Date().toLocaleTimeString(),
      };
      setUser(mockUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      setIsLoading(false);
      triggerToast('success', 'Logged in successfully. Enterprise session established.');
      return true;
    }
    
    setIsLoading(false);
    triggerToast('error', 'Authentication failed. Please enter a valid email and password.');
    return false;
  }, [triggerToast]);

  const register = useCallback(async (name: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (name && email) {
      const mockUser: UserSession = {
        id: 'usr-' + Math.floor(1000 + Math.random() * 9000),
        name: name,
        email: email,
        role: 'Developer Operator',
        lastLogin: new Date().toLocaleTimeString(),
      };
      setUser(mockUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      setIsLoading(false);
      triggerToast('success', 'Enterprise account registered and activated.');
      return true;
    }

    setIsLoading(false);
    triggerToast('error', 'Registration failed. Fill out all required fields.');
    return false;
  }, [triggerToast]);

  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email) {
      setIsLoading(false);
      triggerToast('info', `Password recovery dispatch sent to ${email}. Check secure channels.`);
      return true;
    }

    setIsLoading(false);
    triggerToast('error', 'Please enter a valid email address.');
    return false;
  }, [triggerToast]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    triggerToast('info', 'Enterprise session revoked. Logged out.');
  }, [triggerToast]);

  const updateProfile = useCallback((name: string, avatarUrl?: string) => {
    if (!user) return;
    const updatedUser = { ...user, name, avatarUrl };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    triggerToast('success', 'User profile parameters synchronized.');
  }, [user, triggerToast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        forgotPassword,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
