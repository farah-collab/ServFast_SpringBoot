import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi, AuthUser } from '../api/auth';

interface UserContextType {
  user: AuthUser | null;
  refreshUser: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  refreshUser: () => {},
  updateUser: () => {},
  logout: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => authApi.getCurrentUser());

  const refreshUser = useCallback(() => {
    setUser(authApi.getCurrentUser());
  }, []);

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    authApi.updateStoredUser(partial);
    setUser(authApi.getCurrentUser());
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, refreshUser, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);