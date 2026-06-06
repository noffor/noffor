// app/auth/callback/route.ts - Exchange Error Fixed
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ✅ Force dynamic runtime (NO edge cache)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // ✅ Edge না, Node.js use করুন

export async function GET(request: Request) {
  console.log('🔵 ====== CALLBACK HIT ======');
  
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');
    const next = searchParams.get('next') || 'dashboard';
    const country = searchParams.get('country') || 'qa';
    const lang = searchParams.get('lang') || 'en';
    const role = searchParams.get('role') || 'labor';

    console.log('📋 Params:', { hasCode: !!code, error, country, lang, role, origin });

    if (error) {
      console.error('❌ Google OAuth error:', error, error_description);
      return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=${error}`);
    }

    if (!code) {
      console.error('❌ No code in callback');
      return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=no_code`);
    }

    const cookieStore = await cookies();
    
    console.log('🍪 Cookie count:', cookieStore.getAll().length);
    
    // ✅ SIMPLE Supabase client — no complex cookie options
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            try {
              return cookieStore.getAll();
            } catch (e) {
              console.error('🍪 getAll error:', e);
              return [];
            }
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                // ✅ Simple set
                cookieStore.set(name, value);
              });
              console.log('🍪 Cookies set:', cookiesToSet.length);
            } catch (e) {
              console.error('🍪 setAll error:', e);
            }
          },
        },
      }
    );

    // ✅ Exchange code for session
    console.log('🔄 Exchanging code for session...');
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('❌ Exchange error:', exchangeError);
      console.error('❌ Full error:', JSON.stringify(exchangeError));
      
      // ✅ Redirect to login with specific error
      const loginUrl = new URL(`/${country}/${lang}/login`, origin);
      loginUrl.searchParams.set('error', 'exchange');
      loginUrl.searchParams.set('detail', exchangeError.message?.slice(0, 50) || 'unknown');
      return NextResponse.redirect(loginUrl);
    }

    console.log('✅ Session exchanged successfully');
    console.log('👤 User:', data?.user?.id?.slice(0, 10) + '...');
    console.log('🔑 Session:', !!data?.session);

    const user = data?.user || data?.session?.user;

    if (!user) {
      console.error('❌ No user in session data');
      return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=no_user`);
    }

    // Profile upsert
    try {
      const { data: existing } = await supabase
        .from('profiles').select('id').eq('id', user.id).maybeSingle();

      if (!existing) {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          photo_url: user.user_metadata?.avatar_url || '',
          phone: user.phone || '',
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

      if (role === 'labor') {
        await supabase.from('worker_locations').upsert({
          worker_id: user.id,
          is_online: false,
          last_seen: new Date().toISOString(),
        }, { onConflict: 'worker_id' });
      }
    } catch (dbError: any) {
      console.error('❌ DB error (non-critical):', dbError.message);
      // Continue anyway — user is authenticated
    }

    const dashboardPath = role === 'employer' ? 'dashboard/employer' : 'dashboard';
    const redirectUrl = `${origin}/${country}/${lang}/${dashboardPath}`;
    
    console.log('🔀 Redirecting to:', redirectUrl);
    console.log('✅ ====== CALLBACK COMPLETE ======');

    const response = NextResponse.redirect(redirectUrl);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;

  } catch (err: any) {
    console.error('💥 FATAL Callback error:', err.message);
    console.error('💥 Stack:', err.stack);
    
    const fallbackUrl = new URL('/qa/en/login', request.url);
    fallbackUrl.searchParams.set('error', 'server');
    return NextResponse.redirect(fallbackUrl);
  }
}