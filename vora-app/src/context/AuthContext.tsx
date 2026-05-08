'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getProfile } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Safety Timeout: Force loading to false after 2 seconds no matter what
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);

      // 1. Check for Demo Admin Mode
      if (typeof window !== 'undefined' && localStorage.getItem('vora_demo_admin') === 'true') {
        setProfile({ role: 'admin', email: 'admin@vora.com', full_name: 'Admin Preview' });
        clearTimeout(timer);
        setLoading(false);
        return;
      }

      // 2. Standard Supabase Auth
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const data = await getProfile(session.user.id);
          setProfile(data);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        clearTimeout(timer);
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Don't override if in demo mode
      if (localStorage.getItem('vora_demo_admin') === 'true') return;

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const data = await getProfile(userId);
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('vora_demo_admin'); // Clear demo mode on signout
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const isAdmin = profile?.role === 'admin' || (typeof window !== 'undefined' && localStorage.getItem('vora_demo_admin') === 'true');

  return (
    <AuthContext.Provider value={{ user, session, profile, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
