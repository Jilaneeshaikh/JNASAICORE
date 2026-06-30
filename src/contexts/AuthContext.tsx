import { createContext, useContext } from 'react';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  lastLogin: string;
}

export interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, avatarUrl?: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
