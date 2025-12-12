import React, { createContext, useState, useEffect } from 'react';
import { setAuthToken } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) setAuthToken(token); // ensures axios always has Authorization header
  }, [token]);

  const login = (userObj, token) => {
    setUser(userObj);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('token', token);
    setAuthToken(token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
