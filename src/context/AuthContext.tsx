import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase-config';
import type { User, AuthContextType } from '../types/index';

// Mock auth mode - set to true to bypass Firebase
const USE_MOCK_AUTH = true;

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

  // Load user data from localStorage
  const loadUserData = (uid: string): User | null => {
    const userData = localStorage.getItem(`user_${uid}`);
    if (userData) {
      const parsed = JSON.parse(userData);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
      };
    }
    return null;
  };

  // Save user data to localStorage
  const saveUserData = (userData: User) => {
    localStorage.setItem(`user_${userData.id}`, JSON.stringify(userData));
  };

  // Mock auth: Check for existing session
  useEffect(() => {
    if (USE_MOCK_AUTH) {
      const currentUserId = localStorage.getItem('currentUserId');
      if (currentUserId) {
        const userData = loadUserData(currentUserId);
        if (userData) {
          setUser(userData);
        }
      }
      setLoading(false);
    } else {
      // Real Firebase auth
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          let userData = loadUserData(firebaseUser.uid);
          
          if (!userData) {
            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Anonymous User',
              photoURL: firebaseUser.photoURL || undefined,
              walletBalance: 5000,
              favorites: [],
              createdAt: new Date(),
            };
            saveUserData(userData);
          }
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    }
  }, []);

  const signup = async (email: string, password: string, displayName: string) => {
    if (USE_MOCK_AUTH) {
      // Mock signup
      const userId = `user_${Date.now()}`;
      const userData: User = {
        id: userId,
        email,
        displayName,
        walletBalance: 5000,
        favorites: [],
        createdAt: new Date(),
      };
      saveUserData(userData);
      localStorage.setItem('currentUserId', userId);
      setUser(userData);
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      const userData: User = {
        id: userCredential.user.uid,
        email,
        displayName,
        walletBalance: 5000,
        favorites: [],
        createdAt: new Date(),
      };
      
      saveUserData(userData);
      setUser(userData);
    }
  };

  const login = async (email: string, password: string) => {
    if (USE_MOCK_AUTH) {
      // Mock login - find user by email
      const allKeys = Object.keys(localStorage);
      const userKey = allKeys.find(key => {
        if (key.startsWith('user_')) {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            return parsed.email === email;
          }
        }
        return false;
      });

      if (userKey) {
        const userData = loadUserData(userKey.replace('user_', ''));
        if (userData) {
          localStorage.setItem('currentUserId', userData.id);
          setUser(userData);
        } else {
          throw new Error('User not found');
        }
      } else {
        throw new Error('Invalid email or password');
      }
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  };

  const loginWithGoogle = async () => {
    if (USE_MOCK_AUTH) {
      // Mock Google login
      const userId = `google_${Date.now()}`;
      const userData: User = {
        id: userId,
        email: 'demo@google.com',
        displayName: 'Demo User',
        walletBalance: 5000,
        favorites: [],
        createdAt: new Date(),
      };
      saveUserData(userData);
      localStorage.setItem('currentUserId', userId);
      setUser(userData);
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  };

  const logout = async () => {
    if (USE_MOCK_AUTH) {
      localStorage.removeItem('currentUserId');
      setUser(null);
    } else {
      await signOut(auth);
      setUser(null);
    }
  };

  const toggleFavorite = (vehicleId: string) => {
    if (!user) return;

    const updatedFavorites = user.favorites.includes(vehicleId)
      ? user.favorites.filter(id => id !== vehicleId)
      : [...user.favorites, vehicleId];

    const updatedUser = {
      ...user,
      favorites: updatedFavorites,
    };

    setUser(updatedUser);
    saveUserData(updatedUser);
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
