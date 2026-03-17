'use client';
// WHY 'use client':
// Next.js mein by default sab Server Components hain
// useState, useEffect browser mein chalte hain
// 'use client' lagao → Browser mein run hoga

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Page load pe check karo — user logged in hai?
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Register
  const register = async (userData) => {
    const response = await authAPI.register(userData);
    
    // Token save karo
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    const userWithName = {
    ...response.data.user,
    name: userData.name 
  };
    localStorage.setItem('user', JSON.stringify(userWithName));
  setUser(userWithName);
  return response;
  };

  // Login
  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    setUser(response.data.user);
    return response;
  };

  // Logout
  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      await authAPI.logout(refreshToken);
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Sab clear karo
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — easy use ke liye
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};