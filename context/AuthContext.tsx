// context/AuthContext.tsx - ✅ PROFILE AUTO-CREATE FIXED + LOGOUT FIXED
"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
  });

  const router = useRouter();

  const getCachedProfile = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('noffor_user');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  }, []);

  const setCachedProfile = useCallback((profile: any) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem('noffor_user', JSON.stringify(profile)); } catch {}
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        setCachedProfile(profile);
        setState(prev => ({
          ...prev, profile, loading: false, isAuthenticated: true,
        }));
        return;
      }

      console.log('⚠️ No profile found, creating new...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const newProfile = {
          id: userId,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone: user.phone || '',
          photo_url: user.user_metadata?.avatar_url || '',
          role: 'labor',
          country: 'qa',
          profile_language: 'en',
          is_online: false,
          is_verified: true,
          is_public: true,
          rating: 0,
          total_reviews: 0,
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (insertError) {
          console.error('❌ Profile insert error:', insertError.message);
          setCachedProfile(newProfile);
          setState(prev => ({
            ...prev, profile: newProfile, loading: false, isAuthenticated: true,
          }));
        } else {
          console.log('✅ New profile created');
          setCachedProfile(newProfile);
          setState(prev => ({
            ...prev, profile: newProfile, loading: false, isAuthenticated: true,
          }));
        }
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Load profile error:', error);
      const cached = getCachedProfile();
      setState(prev => ({
        ...prev, profile: cached || null, loading: false, isAuthenticated: !!cached,
      }));
    }
  }, [getCachedProfile, setCachedProfile]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setState(prev => ({ ...prev, session, user: session.user }));
          await loadProfile(session.user.id);
        } else {
          const cached = getCachedProfile();
          setState(prev => ({
            ...prev,
            profile: cached || null,
            loading: false,
            isAuthenticated: !!cached,
          }));
        }
      } catch (error) {
        console.error('Init auth error:', error);
        if (mounted) {
          const cached = getCachedProfile();
          setState(prev => ({
            ...prev, profile: cached || null, loading: false, isAuthenticated: !!cached,
          }));
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setState(prev => ({ ...prev, session, user: session.user }));
            await loadProfile(session.user.id);
          }
        }

        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('noffor_user');
          localStorage.removeItem('noffor_worker');
          localStorage.removeItem('noffor_worker_online');
          try { sessionStorage.clear(); } catch {}
          setState({
            session: null, user: null, profile: null,
            loading: false, isAuthenticated: false,
          });
        }
      }
    );

    return () => { mounted = false; subscription?.unsubscribe(); };
  }, [loadProfile, getCachedProfile]);

  const signOut = useCallback(async () => {
    try {
      const country = state.profile?.country || 'qa';
      const lang = state.profile?.profile_language || 'en';
      
      localStorage.removeItem('noffor_user');
      localStorage.removeItem('noffor_worker');
      localStorage.removeItem('noffor_worker_online');
      try { sessionStorage.clear(); } catch {}

      await supabase.auth.signOut();
      
      setState({
        session: null, user: null, profile: null,
        loading: false, isAuthenticated: false,
      });
      
      window.location.href = `/${country}/${lang}/login`;
    } catch {
      window.location.href = '/qa/en/login';
    }
  }, [state.profile]);

  const refreshProfile = useCallback(async () => {
    if (state.user?.id) await loadProfile(state.user.id);
  }, [state.user?.id, loadProfile]);

  const isAdmin = useMemo(() => state.profile?.role === 'admin', [state.profile]);

  const value = useMemo((): AuthContextType => ({
    session: state.session,
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    signOut, refreshProfile, isAdmin,
  }), [state, signOut, refreshProfile, isAdmin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}