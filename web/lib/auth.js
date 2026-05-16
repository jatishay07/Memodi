'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('memodi_auth');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  function login(userData) {
    localStorage.setItem('memodi_auth', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('memodi_auth');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
