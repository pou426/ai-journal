import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load user on mount
    loadUser();

    // Subscribe to auth state changes
    const { data: authListener } = AuthService.onAuthStateChange(async (session) => {
      if (session) {
        // Fetch full user data when session changes
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      if (authListener && authListener.unsubscribe) {
        authListener.unsubscribe();
      }
    };
  }, []);

  // Load the current user
  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signInWithEmail(email, password);
      await loadUser();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signUpWithEmail(email, password);
      await loadUser();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signInWithGoogle();
      await loadUser();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      await AuthService.signOut();
      setUser(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 