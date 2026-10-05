import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string, rememberMe?: boolean) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin password required to access the admin portal
const ADMIN_PASSWORD = 'HTCeleron1?';
const SESSION_AUTH_KEY = 'r2r_admin_auth_session';
const LOCAL_AUTH_KEY = 'r2r_admin_auth_persistent';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check session storage first, then persistent storage
    try {
      const inSession = sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
      const inLocal = localStorage.getItem(LOCAL_AUTH_KEY) === 'true';
      return inSession || inLocal;
    } catch {
      return false;
    }
  });

  const login = (password: string, rememberMe = false): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
        if (rememberMe) {
          localStorage.setItem(LOCAL_AUTH_KEY, 'true');
        } else {
          localStorage.removeItem(LOCAL_AUTH_KEY);
        }
      } catch (e) {
        console.error('Storage error during login', e);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      localStorage.removeItem(LOCAL_AUTH_KEY);
    } catch (e) {
      console.error('Storage error during logout', e);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
