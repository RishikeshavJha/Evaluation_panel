import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthState {
  isLoggedIn: boolean;
  email: string | null;
  displayName: string | null;
  hasEnteredPin: boolean;
  firebaseUser: User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  enterPin: () => void;
  logout: () => Promise<void>;
  loginError: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    email: null,
    displayName: null,
    hasEnteredPin: false,
    firebaseUser: null,
    loading: true,
  });
  const [loginError, setLoginError] = useState('');

  // PIN state is not automatically persisted across sessions (requires PIN on every fresh page refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthState({
          isLoggedIn: true,
          email: user.email,
          displayName: user.displayName,
          hasEnteredPin: false,
          firebaseUser: user,
          loading: false,
        });
      } else {
        setAuthState({
          isLoggedIn: false,
          email: null,
          displayName: null,
          hasEnteredPin: false,
          firebaseUser: null,
          loading: false,
        });
        sessionStorage.removeItem('teacher_pin_entered');
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setLoginError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('popup-closed-by-user') && !msg.includes('cancelled-popup-request')) {
        setLoginError('Sign-in failed. Please try again.');
      }
    }
  };

  const enterPin = () => {
    sessionStorage.setItem('teacher_pin_entered', 'true');
    setAuthState((prev) => ({ ...prev, hasEnteredPin: true }));
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    sessionStorage.removeItem('teacher_pin_entered');
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, enterPin, logout, loginError }}>
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
