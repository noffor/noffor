// lib/supabase.ts - Singleton Fix • PKCE Compatible
import { createBrowserClient, createServerClient } from '@supabase/ssr';

// ═══════════════════════════════════════════════════════════
// Environment Variables
// ═══════════════════════════════════════════════════════════
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ═══════════════════════════════════════════════════════════
// ✅ SINGLETON: Only ONE browser instance ever
// ═══════════════════════════════════════════════════════════
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // Server-side: return fresh instance (no singleton needed)
  if (typeof window === 'undefined') {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  
  // Browser: return SAME instance (PKCE verifier preserved)
  if (browserClient) {
    return browserClient;
  }
  
  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'noffor_auth',
      // ✅ Change to:
flowType: 'implicit',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
  
  return browserClient;
}

// ═══════════════════════════════════════════════════════════
// Server Client with Next.js 15+ cookie API
// ═══════════════════════════════════════════════════════════
export function createServerSupabase(cookieStore: any) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: any[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            cookieStore.set({
              name,
              value,
              ...options,
            });
          });
        } catch (error) {
          console.error('Cookie set error:', error);
        }
      },
    },
  });
}

// ═══════════════════════════════════════════════════════════
// Admin Client (SERVER ONLY)
// ═══════════════════════════════════════════════════════════
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('⛔ Admin client server only!');
  }
  
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY required');
  }
  
  return createServerClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

// ═══════════════════════════════════════════════════════════
// ✅ Singleton Export (SAME instance everywhere)
// ═══════════════════════════════════════════════════════════
export const supabase = typeof window !== 'undefined'
  ? createClient()
  : createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: { getAll: () => [], setAll: () => {} },
    });

// ═══════════════════════════════════════════════════════════
// Profile Helpers
// ═══════════════════════════════════════════════════════════
export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getProfiles({
  role, country, category, page = 0, limit = 10,
}: {
  role?: string; country?: string; category?: string; page?: number; limit?: number;
}) {
  let query = supabase.from('profiles').select('*', { count: 'exact' });
  if (role) query = query.eq('role', role);
  if (country) query = query.eq('country', country);
  if (category) query = query.eq('category', category);
  
  const from = page * limit;
  const to = from + limit - 1;
  
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);
    
  if (error) throw error;
  return { data, count, hasMore: (count || 0) > to + 1 };
}

// ═══════════════════════════════════════════════════════════
// Auth Helpers
// ═══════════════════════════════════════════════════════════
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  } catch {
    return null;
  }
}

export async function signOut() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('noffor_user');
      localStorage.removeItem('noffor_worker');
      sessionStorage.clear();
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// Storage Helpers
// ═══════════════════════════════════════════════════════════
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage
    .from(bucket).upload(path, file, { cacheControl: '3600', upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ═══════════════════════════════════════════════════════════
// RPC Helper
// ═══════════════════════════════════════════════════════════
export async function callRPC(fn: string, params?: Record<string, any>) {
  const { data, error } = await supabase.rpc(fn, params);
  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════════════════════════
// Health Check
// ═══════════════════════════════════════════════════════════
export async function checkConnection(): Promise<{ connected: boolean; latency: number }> {
  const start = performance.now();
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return { connected: !error, latency: Math.round(performance.now() - start) };
  } catch {
    return { connected: false, latency: -1 };
  }
}

// ═══════════════════════════════════════════════════════════
// Admin Helpers (SERVER ONLY)
// ═══════════════════════════════════════════════════════════
export async function verifyAdminServer(cookieStore: any): Promise<{
  authorized: boolean; userId?: string; role?: string;
}> {
  try {
    const serverClient = createServerSupabase(cookieStore);
    const { data: { session } } = await serverClient.auth.getSession();
    if (!session?.user?.id) return { authorized: false };
    const { data: profile } = await serverClient
      .from('profiles').select('role').eq('id', session.user.id).maybeSingle();
    return {
      authorized: profile?.role === 'admin',
      userId: session.user.id,
      role: profile?.role || undefined,
    };
  } catch (error) {
    console.error('Admin verification error:', error);
    return { authorized: false };
  }
}

export async function getAdminStats() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = serviceKey
    ? createAdminClient()
    : createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: { getAll: () => [], setAll: () => {} },
      });
  
  const [workersRes, onlineRes, employersRes, bookingsRes, bidsRes] = await Promise.all([
    client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'labor'),
    client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'labor').eq('is_online', true),
    client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer'),
    client.from('bookings').select('*', { count: 'exact', head: true }),
    client.from('bids').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  return {
    totalWorkers: workersRes.count || 0,
    onlineWorkers: onlineRes.count || 0,
    totalEmployers: employersRes.count || 0,
    totalBookings: bookingsRes.count || 0,
    activeBids: bidsRes.count || 0,
  };
}

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════
export interface Profile {
  id: string;
  name: string;
  phone: string;
  role: 'labor' | 'employer';
  category: string;
  photo_url: string;
  expected_salary: string;
  experience: string;
  rating: number;
  total_reviews: number;
  is_online: boolean;
  is_verified: boolean;
  city: string;
  area: string;
  country: string;
  profile_language: string;
  skills: string[];
  photos: string[];
  bio: string;
  license: string;
  visa_status: string;
  sponsorship: string;
  accommodation: string;
  food: string;
  languages: string[];
  age: string;
  religion: string;
  nationality: string;
  education: string;
  transport: string;
  insurance: string;
  completed_jobs: number;
  response_time: string;
  created_at: string;
  updated_at: string;
}