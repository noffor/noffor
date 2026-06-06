// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const country = searchParams.get('country') || 'qa';
  const lang = searchParams.get('lang') || 'en';
  const role = searchParams.get('role') || 'labor';

  if (error || !code) {
    return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=${error || 'no_code'}`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // ✅ Production-এ secure cookie
            cookieStore.set(name, value, {
              ...options,
              path: '/',
              secure: true,
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 30, // 30 days
            });
          });
        },
      },
    }
  );

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('Exchange error:', exchangeError);
    return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=exchange&detail=${encodeURIComponent(exchangeError.message)}`);
  }

  const user = data?.user || data?.session?.user;

  if (user) {
    // Profile upsert
    try {
      const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
      
      if (!existing) {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          photo_url: user.user_metadata?.avatar_url || '',
          role: role,
          country,
          profile_language: lang,
          is_online: false,
          is_verified: true,
          rating: 0,
          total_reviews: 0,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        }, { onConflict: 'id' });
      } else {
        await supabase.from('profiles').update({
          last_login: new Date().toISOString(),
        }).eq('id', user.id);
      }
    } catch (e) {
      console.error('Profile error:', e);
    }
  }

  const dashboardPath = role === 'employer' ? 'dashboard/employer' : 'dashboard';
  const redirectUrl = `${origin}/${country}/${lang}/${dashboardPath}`;
  
  const response = NextResponse.redirect(redirectUrl);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}