<<<<<<< HEAD
// mobile/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, User } from '@/services/mockApi';
=======
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User } from '@/services/mockApi';
>>>>>>> origin/main

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
<<<<<<< HEAD
  logout: () => Promise<void>;
=======
  logout: () => void;
>>>>>>> origin/main
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
<<<<<<< HEAD
    // load stored user on startup
    (async () => {
      try {
        const s = await AsyncStorage.getItem('user');
        if (s) {
          const parsed = JSON.parse(s);
          setUser(parsed);
        }
      } catch (err) {
        console.warn('Failed to load stored user', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveUser = async (userObj: User | null, token?: string | null) => {
    try {
      if (!userObj) {
        await AsyncStorage.removeItem('user');
        if (token) await AsyncStorage.removeItem('token');
        setUser(null);
        return;
      }
      const toStore = { ...userObj, token: token || userObj.token };
      await AsyncStorage.setItem('user', JSON.stringify(toStore));
      if (token) await AsyncStorage.setItem('token', token);
      setUser(toStore);
    } catch (err) {
      console.warn('saveUser error', err);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password); // returns { user, token }
      const loggedUser = res.user;
      const token = res.token;
      if (!loggedUser) throw new Error('Login failed: no user returned');
      await saveUser(loggedUser, token);
    } finally {
      setIsLoading(false);
=======
    // Check if user is already logged in
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const loggedInUser = await authApi.login(email, password);
      setUser(loggedInUser);
    } catch (error) {
      throw error;
>>>>>>> origin/main
    }
  };

  const register = async (name: string, email: string, password: string) => {
<<<<<<< HEAD
    setIsLoading(true);
    try {
      const res = await api.register(name, email, password);
      const createdUser = res.user;
      const token = res.token;
      if (!createdUser) throw new Error('Registration succeeded but no user returned');
      await saveUser(createdUser, token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
=======
    try {
      const newUser = await authApi.register(name, email, password);
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
>>>>>>> origin/main
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
<<<<<<< HEAD
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
=======
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

>>>>>>> origin/main
