import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/profile/');
      setUser(data);
    } catch {
      localStorage.removeItem('tokens');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
    if (tokens?.access) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/token/', { username, password });
    localStorage.setItem('tokens', JSON.stringify(data));
    await fetchProfile();
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register/', formData);
    localStorage.setItem('tokens', JSON.stringify(data.tokens));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('tokens');
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const { data } = await api.put('/auth/profile/', formData);
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
