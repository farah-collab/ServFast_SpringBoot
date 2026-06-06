import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi, AuthUser } from '../api/auth';

interface UserContextType {
  user: AuthUser | null;
  /** Call this after any profile update to propagate changes app-wide */
  refreshUser: () => void;
  /** Update specific fields in the stored user and re-render all consumers */
  updateUser: (partial: Partial<AuthUser>) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  refreshUser: () => {},
  updateUser: () => {},
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

  return (
    <UserContext.Provider value={{ user, refreshUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
