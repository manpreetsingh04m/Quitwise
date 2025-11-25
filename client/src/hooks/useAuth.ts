import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUserProfile, getUserProfile } from '../services/firebaseService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ensureUserDocument = async (firebaseUser: User) => {
      try {
        const existingProfile = await getUserProfile(firebaseUser.uid);
        if (!existingProfile) {
          await createUserProfile(firebaseUser.uid, {
            email: firebaseUser.email || undefined,
            displayName: firebaseUser.displayName || 'QuitWise User',
          });
        }
      } catch (error) {
        console.error('Error ensuring user profile:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          const result = await signInAnonymously(auth);
          setUser(result.user);
          await ensureUserDocument(result.user);
        } else {
          setUser(firebaseUser);
          await ensureUserDocument(firebaseUser);
        }
      } catch (error) {
        console.error('Error during authentication:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loginAnonymously = async () => {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    loginAnonymously,
    logout,
  };
};

