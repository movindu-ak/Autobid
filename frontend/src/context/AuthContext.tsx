import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
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
    // Google login not implemented yet on backend
    throw new Error('Google login not available yet');
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
