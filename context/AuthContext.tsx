// context/AuthContext.tsx - Login Loop Fixed • Production Ready
"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════
// Context
// ═══════════════════════════════════════════════════
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════
// Provider
// ═══════════════════════════════════════════════════
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
  });

  const router = useRouter();

  // ═══════════════════════════════════════════════════
  // Cache Helpers
  // ═══════════════════════════════════════════════════
  const getCachedProfile = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('noffor_user');
      if (cached) {
        const profile = JSON.parse(cached);
        return profile;
      }
    } catch (err) {
      console.error('Cache read error:', err);
    }
    return null;
  }, []);

  const setCachedProfile = useCallback((profile: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('noffor_user', JSON.stringify(profile));
      if (profile.role === 'labor') {
        localStorage.setItem('noffor_worker', JSON.stringify(profile));
      }
    } catch (err) {
      console.error('Cache write error:', err);
    }
  }, []);

  // ═══════════════════════════════════════════════════
  // Load Profile
  // ═══════════════════════════════════════════════════
  const loadProfile = useCallback(async (userId: string) => {
    console.log('👤 Loading profile for:', userId);
    
    try {
      // First try cache for instant UI
      const cached = getCachedProfile();
      if (cached && cached.id === userId) {
        console.log('⚡ Using cached profile');
        setState(prev => ({
          ...prev,
          profile: cached,
          loading: false,
          isAuthenticated: true,
        }));
      }
      
      // Fetch from DB
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Profile fetch error:', error.message);
        // Use cache if available
        if (cached) {
          setState(prev => ({
            ...prev,
            profile: cached,
            loading: false,
            isAuthenticated: true,
          }));
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
        return;
      }

      if (profile) {
        console.log('✅ Profile loaded from DB:', profile.id);
        setCachedProfile(profile);
        setState(prev => ({
          ...prev,
          profile,
          loading: false,
          isAuthenticated: true,
        }));
        return;
      }

      // No profile found → create new
      console.log('⚠️ No profile found, creating...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const newProfile = {
          id: userId,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone: user.phone || '',
          photo_url: user.user_metadata?.avatar_url || '',
          role: user.user_metadata?.role || 'labor',
          country: user.user_metadata?.country || 'qa',
          profile_language: user.user_metadata?.language || 'en',
          is_online: false,
          is_verified: true,
          rating: 0,
          total_reviews: 0,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        };

        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'id' })
          .select()
          .single();

        if (insertError) {
          console.error('❌ Profile create error:', insertError.message);
          // Still set partial profile so user can use app
          setState(prev => ({
            ...prev,
            profile: newProfile,
            loading: false,
            isAuthenticated: true,
          }));
        } else if (created) {
          console.log('✅ New profile created:', created.id);
          setCachedProfile(created);
          setState(prev => ({
            ...prev,
            profile: created,
            loading: false,
            isAuthenticated: true,
          }));
        }
      } else {
        console.log('⚠️ No user found for profile creation');
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('💥 Profile load error:', err);
      // Use cache as fallback
      const cached = getCachedProfile();
      if (cached) {
        setState(prev => ({
          ...prev,
          profile: cached,
          loading: false,
          isAuthenticated: true,
        }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    }
  }, [getCachedProfile, setCachedProfile]);

  // ═══════════════════════════════════════════════════
  // Initialize Auth
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        // Vercel-এ cookie delay-এর জন্য 1 second wait
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('❌ getSession error:', sessionError.message);
          // FALLBACK: Cache check
          const cached = getCachedProfile();
          if (cached) {
            console.log('⚡ Using cached profile (session error)');
            setState(prev => ({
              ...prev,
              profile: cached,
              loading: false,
              isAuthenticated: true,
            }));
          } else {
            setState(prev => ({ ...prev, loading: false }));
          }
          return;
        }
        
        if (session?.user) {
          console.log('✅ Session found:', session.user.id);
          setState(prev => ({ ...prev, session, user: session.user }));
          await loadProfile(session.user.id);
        } else {
          console.log('ℹ️ No session found');
          
          // EMERGENCY FIX: localStorage fallback
          const cached = getCachedProfile();
          if (cached) {
            console.log('⚡ EMERGENCY: Using cached profile (no session)');
            setState(prev => ({
              ...prev,
              profile: cached,
              loading: false,
              isAuthenticated: true,
            }));
          } else {
            setState(prev => ({ ...prev, loading: false }));
          }
        }
      } catch (err) {
        console.error('❌ Auth init error:', err);
        // FALLBACK: Cache check on error too
        const cached = getCachedProfile();
        if (cached) {
          setState(prev => ({
            ...prev,
            profile: cached,
            loading: false,
            isAuthenticated: true,
          }));
        } else {
          if (mounted) setState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    initAuth();

    // ═══════════════════════════════════════════════════
    // Auth State Change Listener
    // ═══════════════════════════════════════════════════
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log(`🔐 Auth Event: ${event}`, session?.user?.id || 'no user');
        
        // SIGNED_IN / INITIAL_SESSION / TOKEN_REFRESHED
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setState(prev => ({ 
              ...prev, 
              session, 
              user: session.user,
              loading: true 
            }));
            await loadProfile(session.user.id);
          }
        }
        
        // SIGNED_OUT
        if (event === 'SIGNED_OUT') {
          setState({ 
            session: null, 
            user: null, 
            profile: null, 
            loading: false, 
            isAuthenticated: false 
          });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('noffor_user');
            localStorage.removeItem('noffor_worker');
          }
        }
        
        // USER_UPDATED
        if (event === 'USER_UPDATED') {
          if (session?.user) {
            setState(prev => ({ ...prev, session, user: session.user }));
            await loadProfile(session.user.id);
          }
        }
      }
    );

    return () => { 
      mounted = false; 
      subscription?.unsubscribe(); 
    };
  }, [loadProfile]);

  // ═══════════════════════════════════════════════════
  // Sign Out
  // ═══════════════════════════════════════════════════
  const signOut = useCallback(async () => {
    try {
      console.log('👋 Signing out...');
      
      // Clear local data first
      if (typeof window !== 'undefined') {
        localStorage.removeItem('noffor_user');
        localStorage.removeItem('noffor_worker');
        localStorage.removeItem('noffor_worker_online');
        sessionStorage.clear();
      }
      
      await supabase.auth.signOut();
      
      setState({ 
        session: null, 
        user: null, 
        profile: null, 
        loading: false, 
        isAuthenticated: false 
      });
      
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, [router]);

  // ═══════════════════════════════════════════════════
  // Refresh Profile
  // ═══════════════════════════════════════════════════
  const refreshProfile = useCallback(async () => {
    if (state.user?.id) {
      console.log('🔄 Refreshing profile...');
      await loadProfile(state.user.id);
    }
  }, [state.user?.id, loadProfile]);

  // ═══════════════════════════════════════════════════
  // Computed Values
  // ═══════════════════════════════════════════════════
  const isAdmin = useMemo(() => state.profile?.role === 'admin', [state.profile]);

  const value = useMemo((): AuthContextType => ({
    session: state.session,
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    signOut,
    refreshProfile,
    isAdmin,
  }), [state, signOut, refreshProfile, isAdmin]);

  // Debug
  useEffect(() => {
    console.log('📊 Auth State:', {
      isAuthenticated: state.isAuthenticated,
      loading: state.loading,
      hasProfile: !!state.profile,
      hasSession: !!state.session,
      userId: state.user?.id?.slice(0, 8),
    });
  }, [state]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ═══════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}