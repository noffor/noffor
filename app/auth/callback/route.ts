// app/auth/callback/route.ts - OAuth + Login Loop Fixed
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const next = searchParams.get('next') || 'dashboard';
    const country = searchParams.get('country') || 'qa';
    const lang = searchParams.get('lang') || 'en';

    // ═══════════════════════════════════════════════════
    // Handle OAuth Errors
    // ═══════════════════════════════════════════════════
    if (error) {
      console.error('OAuth Error:', error, errorDescription);
      const redirectUrl = new URL(`/${country}/${lang}/login`, origin);
      redirectUrl.searchParams.set('error', error);
      redirectUrl.searchParams.set('message', errorDescription || 'Login failed. Please try again.');
      return NextResponse.redirect(redirectUrl);
    }

    if (!code) {
      const redirectUrl = new URL(`/${country}/${lang}/login`, origin);
      redirectUrl.searchParams.set('error', 'no_code');
      redirectUrl.searchParams.set('message', 'No authorization code received.');
      return NextResponse.redirect(redirectUrl);
    }

    // ═══════════════════════════════════════════════════
    // Exchange code for session
    // ═══════════════════════════════════════════════════
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Exchange error:', exchangeError.message);
      const redirectUrl = new URL(`/${country}/${lang}/login`, origin);
      redirectUrl.searchParams.set('error', 'exchange_failed');
      redirectUrl.searchParams.set('message', exchangeError.message);
      return NextResponse.redirect(redirectUrl);
    }

    console.log('✅ Code exchanged successfully');

    // ═══════════════════════════════════════════════════
    // Get user
    // ═══════════════════════════════════════════════════
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User error:', userError?.message);
      const redirectUrl = new URL(`/${country}/${lang}/login`, origin);
      redirectUrl.searchParams.set('error', 'no_user');
      redirectUrl.searchParams.set('message', 'User not found. Please try again.');
      return NextResponse.redirect(redirectUrl);
    }

    console.log('✅ User found:', user.id);

    // ═══════════════════════════════════════════════════
    // Create/Update Profile (non-blocking)
    // ═══════════════════════════════════════════════════
    const pendingRole = searchParams.get('role') || 'labor';

    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('profiles').update({
          last_login: new Date().toISOString(),
        }).eq('id', user.id);
        console.log('✅ Existing profile updated');
      } else {
        const { error: insertError } = await supabase.from('profiles').upsert({
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          photo_url: user.user_metadata?.avatar_url || '',
          phone: user.phone || '',
          role: pendingRole,
          country,
          profile_language: lang,
          is_online: false,
          is_verified: true,
          rating: 0,
          total_reviews: 0,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        }, { onConflict: 'id' });

        if (insertError) {
          console.error('Insert error (non-fatal):', insertError.message);
        } else {
          console.log('✅ New profile created');
        }
      }

      // Create worker location if labor
      if (pendingRole === 'labor') {
        await supabase.from('worker_locations').upsert({
          worker_id: user.id,
          is_online: false,
          last_seen: new Date().toISOString(),
        }, { onConflict: 'worker_id' });
      }
    } catch (profileError) {
      console.error('Profile error (non-fatal):', profileError);
      // Continue anyway - AuthContext will handle profile creation
    }

    // ═══════════════════════════════════════════════════
    // Success Redirect
    // ═══════════════════════════════════════════════════
    const redirectUrl = new URL(`/${country}/${lang}/${next}`, origin);
    // Cache busting
    redirectUrl.searchParams.set('t', Date.now().toString());
    
    console.log('🔄 Redirecting to:', redirectUrl.pathname);
    return NextResponse.redirect(redirectUrl);

  } catch (err: any) {
    console.error('💥 Callback error:', err);
    const fallbackUrl = new URL('/qa/en/login', new URL(request.url).origin);
    fallbackUrl.searchParams.set('error', 'server_error');
    fallbackUrl.searchParams.set('message', 'Server error. Please try again.');
    return NextResponse.redirect(fallbackUrl);
  }
}