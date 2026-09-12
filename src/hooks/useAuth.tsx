import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthState {
  isLoggedIn: boolean;
  email: string | null;
  hasEnteredPin: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string) => void;
  enterPin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem('authState');
    if (stored) {
      return JSON.parse(stored);
    }
    return { isLoggedIn: false, email: null, hasEnteredPin: false };
  });

  useEffect(() => {
    localStorage.setItem('authState', JSON.stringify(authState));
  }, [authState]);

  const login = (email: string) => {
    setAuthState({ isLoggedIn: true, email, hasEnteredPin: false });
  };

  const enterPin = () => {
    setAuthState(prev => ({ ...prev, hasEnteredPin: true }));
  };

  const logout = () => {
    setAuthState({ isLoggedIn: false, email: null, hasEnteredPin: false });
    localStorage.removeItem('authState');
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, enterPin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
