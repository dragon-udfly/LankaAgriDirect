import React, { createContext, useContext, useState } from 'react';

interface AdminUser { id: string; name: string; email: string; role: string; }
interface AuthCtx { admin: AdminUser | null; signIn: (token: string, user: AdminUser) => void; signOut: () => void; }

const AuthContext = createContext<AuthCtx | null>(null);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const raw = localStorage.getItem('admin_user');
    return raw ? JSON.parse(raw) : null;
  });

  const signIn = (token: string, user: AdminUser) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    setAdmin(user);
  };

  const signOut = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdmin(null);
  };

  return <AuthContext.Provider value={{ admin, signIn, signOut }}>{children}</AuthContext.Provider>;
};

export const useAdminAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
};
