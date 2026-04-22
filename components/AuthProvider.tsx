'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

export interface UserProfile {
  uid: string;
  email: string;
  nome: string;
  congregacao: string;
  role: 'admin' | 'usuario';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginWithGoogle: (congregacao?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchProfile = async (uid: string) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
    setUser(null);
    router.push('/login');
  };

  const loginWithGoogle = async (congregacao: string = 'Sede') => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const currentUser = result.user;
    
    // Check if user exists
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!userDoc.exists()) {
      // Create profile
      const newProfile: Partial<UserProfile> & { createdAt: any } = {
        email: currentUser.email || '',
        nome: currentUser.displayName || 'Novo Usuário',
        congregacao,
        role: currentUser.email === 'jrsantos.hds@gmail.com' ? 'admin' : 'usuario',
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, 'users', currentUser.uid), newProfile);
      setProfile({ ...newProfile, uid: currentUser.uid } as UserProfile);
    } else {
      setProfile(userDoc.data() as UserProfile);
    }
    
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, loginWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
