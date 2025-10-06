import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Student, Teacher } from '@/lib/api';

interface AuthContextType {
  user: Student | Teacher | null;
  userType: 'student' | 'teacher' | null;
  login: (user: Student | Teacher, type: 'student' | 'teacher') => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Student | Teacher | null>(null);
  const [userType, setUserType] = useState<'student' | 'teacher' | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedUserType = localStorage.getItem('userType');
    if (savedUser && savedUserType) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType as 'student' | 'teacher');
    }
  }, []);

  const login = (user: Student | Teacher, type: 'student' | 'teacher') => {
    setUser(user);
    setUserType(type);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userType', type);
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
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
