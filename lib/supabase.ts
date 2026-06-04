// lib/supabase.ts - ১ বিলিয়ন ইউজার • SSR Compatible • PKCE Fix • Admin Ready
import { createBrowserClient, createServerClient } from '@supabase/ssr';

// ═══════════════════════════════════════════════════════════
// Environment Variables
// ═══════════════════════════════════════════════════════════
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ═══════════════════════════════════════════════════════════
// Browser Client (Client Components)
// ═══════════════════════════════════════════════════════════
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// ═══════════════════════════════════════════════════════════
// Server Client (Server Components / Route Handlers)
// ═══════════════════════════════════════════════════════════
export function createServerSupabase(cookieStore: any) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value, options }: any) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}

// ═══════════════════════════════════════════════════════════
// 🆕 Admin Client (Service Role - Bypasses RLS)
// ═══════════════════════════════════════════════════════════
export function createAdminClient() {
  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
    throw new Error('Service role key is required for admin operations');
  }
  return createBrowserClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ═══════════════════════════════════════════════════════════
// Legacy Export - Auto-detect (Browser/Server)
// ═══════════════════════════════════════════════════════════
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// ═══════════════════════════════════════════════════════════
// 🆕 Admin Helper Functions
// ═══════════════════════════════════════════════════════════

// অ্যাডমিন চেক (ক্লায়েন্ট সাইড)
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error || !data) return false;
    return data.role === 'admin';
  } catch {
    return false;
  }
}

// অ্যাডমিন চেক (সার্ভার সাইড - সার্ভিস রোল ব্যবহার করে)
export async function verifyAdminServer(cookieStore: any): Promise<{
  authorized: boolean;
  userId?: string;
  role?: string;
}> {
  try {
    const serverClient = createServerSupabase(cookieStore);
    const { data: { session } } = await serverClient.auth.getSession();
    
    if (!session?.user?.id) {
      return { authorized: false };
    }

    // সার্ভিস রোল দিয়ে চেক (RLS বাইপাস)
    if (supabaseServiceKey) {
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      return {
        authorized: profile?.role === 'admin',
        userId: session.user.id,
        role: profile?.role || undefined,
      };
    }

    // ফলব্যাক: সাধারণ ক্লায়েন্ট দিয়ে চেক
    const { data: profile } = await serverClient
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

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

// অ্যাডমিন স্ট্যাটস লোড (সার্ভিস রোল দিয়ে)
export async function getAdminStats() {
  const client = supabaseServiceKey ? createAdminClient() : supabase;
  
  const [workersRes, onlineRes, employersRes, bidsRes] = await Promise.all([
    client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'labor'),
    client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'labor').eq('is_online', true),
    client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer'),
    client.from('bids').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  return {
    totalWorkers: workersRes.count || 0,
    onlineWorkers: onlineRes.count || 0,
    totalEmployers: employersRes.count || 0,
    activeBids: bidsRes.count || 0,
  };
}

// ═══════════════════════════════════════════════════════════
// Existing Helper Functions (Unchanged)
// ═══════════════════════════════════════════════════════════
export async function getProfile(id: string) {
  const cacheKey = `profile:${id}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.t < 30000) return parsed.data;
    }
  } catch {}

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ data, t: Date.now() }));
  } catch {}

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
  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw error;
  return { data, count, hasMore: (count || 0) > to + 1 };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  localStorage.removeItem('noffor_user');
  localStorage.removeItem('noffor_worker');
  localStorage.removeItem('noffor_worker_online');
  sessionStorage.clear();
}

export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600', upsert: true,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function callRPC(fn: string, params?: Record<string, any>) {
  const { data, error } = await supabase.rpc(fn, params);
  if (error) throw error;
  return data;
}

export async function checkConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch { return false; }
}

export interface Profile {
  id: string; name: string; phone: string; role: 'labor' | 'employer';
  category: string; photo_url: string; expected_salary: string; experience: string;
  rating: number; total_reviews: number; is_online: boolean; is_verified: boolean;
  city: string; area: string; country: string; profile_language: string;
  skills: string[]; photos: string[]; bio: string; license: string;
  visa_status: string; sponsorship: string; accommodation: string; food: string;
  languages: string[]; age: string; religion: string; nationality: string;
  education: string; transport: string; insurance: string; completed_jobs: number;
  response_time: string; created_at: string; updated_at: string;
}