import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getMe} from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);       // {id, name, role, verificationStatus, profilePictureUrl}
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start, restore session from AsyncStorage
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('auth_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Corrupted storage — ignore and start fresh
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (authResponse) => {
    const {token: t, id, name, role, verificationStatus, profilePictureUrl} = authResponse;
    const userData = {id, name, role, verificationStatus, profilePictureUrl: profilePictureUrl || null};
    await AsyncStorage.setItem('auth_token', t);
    await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(t);
    setUser(userData);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  /**
   * Re-fetch user data from the backend and update local state.
   * Call this after profile updates to keep the dashboard in sync.
   */
  const refreshUser = async () => {
    try {
      const res = await getMe();
      const data = res.data;
      const userData = {
        id: data.id,
        name: data.name,
        role: data.role,
        verificationStatus: data.verificationStatus,
        profilePictureUrl: data.profilePictureUrl || null,
      };
      await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
      setUser(userData);
    } catch {
      // Silently fail — user data will be stale but functional
    }
  };

  const isProducer = () => user?.role === 'PRODUCER';
  const isAdmin = () => user?.role === 'ADMIN';
  const isVerified = () => user?.verificationStatus === 'verified';

  return (
    <AuthContext.Provider value={{user, token, loading, signIn, signOut, refreshUser, isProducer, isAdmin, isVerified}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
