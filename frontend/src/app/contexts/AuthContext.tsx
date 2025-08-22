'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authApi from '../api/auth';

interface User {
  _id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setupAdmin: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkUserLoggedIn = async () => {
      try {
        if (authApi.isAuthenticated()) {
          const userData = await authApi.getMe();
          setUser(userData.data);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        authApi.logout();
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loginResponse = await authApi.login(email, password);
      if (loginResponse && loginResponse.token) {
        const userData = await authApi.getMe();
        setUser(userData.data);
        router.push('/dashboard');
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const setupAdmin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const setupResponse = await authApi.setupAdmin(email, password);
      if (setupResponse && setupResponse.token) {
        const userData = await authApi.getMe();
        setUser(userData.data);
        router.push('/dashboard');
      } else {
        throw new Error('Invalid setup response');
      }
    } catch (error) {
      console.error('Setup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setupAdmin,
        isAuthenticated: !!user,
      }}
    >
      {isInitialized ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};