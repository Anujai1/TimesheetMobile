import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/apiClient';

type User = { id: string; email: string; displayName?: string; role?: string } | null;

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (e) {
          await AsyncStorage.removeItem('accessToken');
          setUser(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken } = res.data;
    await AsyncStorage.setItem('accessToken', accessToken);
    const me = (await api.get('/auth/me')).data;
    setUser(me);
    return me;
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
