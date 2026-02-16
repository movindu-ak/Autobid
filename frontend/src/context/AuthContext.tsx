import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase-config';
import type { User, AuthContextType } from '../types/index';

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const signup = async (email: string, password: string, displayName: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, displayName }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to sign up');
    }

    // Save token and user data
    localStorage.setItem('auth_token', data.data.token);
    const userData: User = {
      id: data.data.user.id,
      email: data.data.user.email,
      displayName: data.data.user.displayName,
      photoURL: data.data.user.photoURL,
      balance: data.data.user.balance,
      walletBalance: data.data.user.walletBalance,
      favorites: data.data.user.favorites,
      createdAt: new Date(data.data.user.createdAt),
    };
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to log in');
    }

    // Save token and user data
    localStorage.setItem('auth_token', data.data.token);
    const userData: User = {
      id: data.data.user.id,
      email: data.data.user.email,
      displayName: data.data.user.displayName,
      photoURL: data.data.user.photoURL,
      balance: data.data.user.balance,
      walletBalance: data.data.user.walletBalance,
      favorites: data.data.user.favorites,
      createdAt: new Date(data.data.user.createdAt),
    };
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
  };

  const loginWithGoogle = async () => {
    try {
      // Check if Firebase is properly configured
      if (!auth || !googleProvider) {
        throw new Error('Google Sign-In is not configured. Please set up Firebase.');
      }

      // Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Send Google user info to backend
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          photoURL: firebaseUser.photoURL,
          googleId: firebaseUser.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to authenticate with Google');
      }

      // Save token and user data
      localStorage.setItem('auth_token', data.data.token);
      const userData: User = {
        id: data.data.user.id,
        email: data.data.user.email,
        displayName: data.data.user.displayName,
        photoURL: data.data.user.photoURL,
        balance: data.data.user.balance,
        walletBalance: data.data.user.walletBalance,
        favorites: data.data.user.favorites,
        createdAt: new Date(data.data.user.createdAt),
      };
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      // Provide more helpful error message
      if (error.code === 'auth/internal-error') {
        throw new Error('Google Sign-In is not properly configured. Please use email/password signup or contact support.');
      }
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const logout = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const toggleFavorite = async (vehicleId: string) => {
    if (!user) return;

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/auth/favorites/${vehicleId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const updatedUser = {
        ...user,
        favorites: data.data.favorites,
      };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    toggleFavorite,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
