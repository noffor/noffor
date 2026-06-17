// context/AuthContext.tsx - ✅ PROFILE AUTO-CREATE FIXED + LOGOUT FIXED + INITIAL CHECK
"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════
// AuthProvider Component
// ═══════════════════════════════════════════════════════════
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
  });
  
  // ✅ ইনিশিয়াল চেক ট্র্যাক করার জন্য
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  const mountedRef = useRef(true);
  const profileLoadingRef = useRef(false); // ডাবল প্রোফাইল লোডিং প্রতিরোধ

  const router = useRouter();

  // ═══════════════════════════════════════════════════════════
  // Cache Helpers
  // ═══════════════════════════════════════════════════════════
  const getCachedProfile = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('noffor_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, []);

  const setCachedProfile = useCallback((profile: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('noffor_user', JSON.stringify(profile));
    } catch {
      // Silently fail if localStorage is full
    }
  }, []);

  const clearAllCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('noffor_user');
      localStorage.removeItem('noffor_worker');
      localStorage.removeItem('noffor_worker_online');
      sessionStorage.clear();
    } catch {
      // Silently fail
    }
  }, []);

  // ═══════════════════════════════════════════════════════════
  // Load Profile (with auto-create fallback)
  // ═══════════════════════════════════════════════════════════
  const loadProfile = useCallback(async (userId: string) => {
    // ডাবল লোডিং প্রতিরোধ
    if (profileLoadingRef.current) return;
    profileLoadingRef.current = true;

    try {
      // 1. Try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!mountedRef.current) return;

      if (existingProfile && !fetchError) {
        // ✅ Profile exists
        setCachedProfile(existingProfile);
        setState(prev => ({
          ...prev,
          profile: existingProfile,
          loading: false,
          isAuthenticated: true,
        }));
        setInitialCheckDone(true);
        profileLoadingRef.current = false;
        return;
      }

      // 2. Profile doesn't exist - Auto-create
      console.log('⚠️ No profile found for user:', userId, '- Creating new profile...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const newProfile = {
          id: userId,
          name: user.user_metadata?.full_name || 
                user.email?.split('@')[0] || 
                user.phone?.replace(/[^0-9]/g, '') || 
                'User',
          email: user.email || '',
          phone: user.phone || '',
          photo_url: user.user_metadata?.avatar_url || '',
          role: 'labor',
          country: 'qa',
          city: null,
          area: null,
          category: null,
          profile_language: 'en',
          is_online: false,
          is_verified: true,   // ✅ Auto-verified
          is_public: false,     // Default private
          rating: 0,
          total_reviews: 0,
          experience: null,
          expected_salary: null,
          license: null,
          languages: null,
          visa_status: null,
          sponsorship: null,
          accommodation: null,
          food: null,
          bio: null,
          photos: [],
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (insertError) {
          console.error('❌ Profile auto-create failed:', insertError.message);
          // Store in cache anyway for offline access
          setCachedProfile(newProfile);
        } else {
          console.log('✅ New profile created successfully');
          setCachedProfile(newProfile);
        }

        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            profile: newProfile,
            loading: false,
            isAuthenticated: true,
          }));
          setInitialCheckDone(true);
        }
      } else {
        // No user found in auth
        if (mountedRef.current) {
          setState(prev => ({ ...prev, loading: false }));
          setInitialCheckDone(true);
        }
      }
    } catch (error) {
      console.error('❌ Load profile error:', error);
      
      // Fallback to cached profile
      const cached = getCachedProfile();
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          profile: cached || null,
          loading: false,
          isAuthenticated: !!cached,
        }));
        setInitialCheckDone(true);
      }
    } finally {
      profileLoadingRef.current = false;
    }
  }, [getCachedProfile, setCachedProfile]);

  // ═══════════════════════════════════════════════════════════
  // Initialize Auth
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    mountedRef.current = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mountedRef.current) return;

        if (session?.user) {
          setState(prev => ({ ...prev, session, user: session.user }));
          await loadProfile(session.user.id);
        } else {
          // No session - check cache
          const cached = getCachedProfile();
          setState(prev => ({
            ...prev,
            profile: cached || null,
            loading: false,
            isAuthenticated: false, // ❌ No session = not authenticated
          }));
          setInitialCheckDone(true);
        }
      } catch (error) {
        console.error('Init auth error:', error);
        if (mountedRef.current) {
          const cached = getCachedProfile();
          setState(prev => ({
            ...prev,
            profile: cached || null,
            loading: false,
            isAuthenticated: false,
          }));
          setInitialCheckDone(true);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;

        console.log('🔄 Auth state changed:', event);

        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              setState(prev => ({ ...prev, session, user: session.user }));
              await loadProfile(session.user.id);
            }
            break;

          case 'SIGNED_OUT':
            clearAllCache();
            setState({
              session: null,
              user: null,
              profile: null,
              loading: false,
              isAuthenticated: false,
            });
            setInitialCheckDone(true);
            break;

          case 'USER_UPDATED':
            if (session?.user) {
              setState(prev => ({ ...prev, session, user: session.user }));
            }
            break;

          default:
            break;
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, [loadProfile, getCachedProfile, clearAllCache]);

  // ═══════════════════════════════════════════════════════════
  // Sign Out
  // ═══════════════════════════════════════════════════════════
  const signOut = useCallback(async () => {
    try {
      const country = state.profile?.country || 'qa';
      const lang = state.profile?.profile_language || 'en';
      
      // Clear all cache
      clearAllCache();

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error.message);
        // Force clear even if Supabase fails
        clearAllCache();
      }
      
      // Reset state
      setState({
        session: null,
        user: null,
        profile: null,
        loading: false,
        isAuthenticated: false,
      });
      setInitialCheckDone(true);
      
      // Redirect to login
      router.push(`/${country}/${lang}/login`);
    } catch (err) {
      console.error('Sign out exception:', err);
      // Emergency fallback
      clearAllCache();
      setState({
        session: null,
        user: null,
        profile: null,
        loading: false,
        isAuthenticated: false,
      });
      setInitialCheckDone(true);
      window.location.href = '/qa/en/login';
    }
  }, [state.profile, clearAllCache, router]);

  // ═══════════════════════════════════════════════════════════
  // Refresh Profile
  // ═══════════════════════════════════════════════════════════
  const refreshProfile = useCallback(async () => {
    if (state.user?.id) {
      profileLoadingRef.current = false; // Reset to allow reload
      await loadProfile(state.user.id);
    }
  }, [state.user?.id, loadProfile]);

  // ═══════════════════════════════════════════════════════════
  // Derived Values
  // ═══════════════════════════════════════════════════════════
  const isAdmin = useMemo(
    () => state.profile?.role === 'admin',
    [state.profile?.role]
  );

  // ✅ ফিক্সড — initialCheckDone false হলেও loading false:
  const loading = useMemo(
    () => state.loading,
    [state.loading]
  );

  const value = useMemo((): AuthContextType => ({
    session: state.session,
    user: state.user,
    profile: state.profile,
    loading,                              // ✅ Combined loading state
    isAuthenticated: state.isAuthenticated,
    signOut,
    refreshProfile,
    isAdmin,
  }), [state.session, state.user, state.profile, loading, state.isAuthenticated, signOut, refreshProfile, isAdmin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════
// useAuth Hook
// ═══════════════════════════════════════════════════════════
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}