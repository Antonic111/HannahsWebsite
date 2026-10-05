import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin password required to access the admin portal
const ADMIN_PASSWORD = 'HTCeleron1?';

// 2 hours session expiry in milliseconds
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;
const SESSION_EXPIRY_KEY = 'r2r_admin_session_expiry';

const checkIsSessionValid = (): boolean => {
  try {
    const rawExpiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    if (!rawExpiry) return false;
    const expiresAt = parseInt(rawExpiry, 10);
    if (isNaN(expiresAt) || Date.now() >= expiresAt) {
      localStorage.removeItem(SESSION_EXPIRY_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return checkIsSessionValid();
  });

  // Verify session validity whenever window gains focus or on interval
  useEffect(() => {
    const verifySession = () => {
      const isValid = checkIsSessionValid();
      if (!isValid && isAuthenticated) {
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('focus', verifySession);
    const interval = setInterval(verifySession, 60 * 1000); // Check every minute

    return () => {
      window.removeEventListener('focus', verifySession);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      try {
        const expiresAt = Date.now() + SESSION_DURATION_MS;
        localStorage.setItem(SESSION_EXPIRY_KEY, expiresAt.toString());
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
      localStorage.removeItem(SESSION_EXPIRY_KEY);
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
