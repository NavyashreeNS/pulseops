import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pulseops_user');
    return saved ? JSON.parse(saved) : { username: 'admin', role: 'ROLE_ADMIN' };
  });
  const [token, setToken] = useState(() => localStorage.getItem('pulseops_token') || '');

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    const userInfo = {
      username: data.username,
      email: data.email,
      role: data.role,
    };
    setUser(userInfo);
    setToken(data.token);
    localStorage.setItem('pulseops_token', data.token);
    localStorage.setItem('pulseops_user', JSON.stringify(userInfo));
    return userInfo;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    const userInfo = {
      username: data.username,
      email: data.email,
      role: data.role,
    };
    setUser(userInfo);
    setToken(data.token);
    localStorage.setItem('pulseops_token', data.token);
    localStorage.setItem('pulseops_user', JSON.stringify(userInfo));
    return userInfo;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('pulseops_token');
    localStorage.removeItem('pulseops_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token || !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
