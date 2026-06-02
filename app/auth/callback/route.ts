// app/auth/callback/route.ts - PKCE Fix
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') || 'dashboard';
    const country = searchParams.get('country') || 'qa';
    const lang = searchParams.get('lang') || 'en';

    if (!code) {
      return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=no_code`);
    }

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

    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Exchange error:', exchangeError);
      return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=exchange_failed`);
    }

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=no_user`);
    }

    const pendingRole = searchParams.get('role') || 'labor';

    // Check existing profile
    const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();

    if (existing) {
      await supabase.from('profiles').update({
        last_login: new Date().toISOString(),
        role: pendingRole,
      }).eq('id', user.id);
    } else {
      const { error: insertError } = await supabase.from('profiles').insert({
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
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=profile_create_failed`);
      }
    }

    if (pendingRole === 'labor') {
      await supabase.from('worker_locations').upsert({
        worker_id: user.id,
        is_online: false,
        last_seen: new Date().toISOString(),
      }, { onConflict: 'worker_id' });
    }

    const redirectUrl = `${origin}/${country}/${lang}/${next}`;
    return NextResponse.redirect(redirectUrl);

  } catch (err: any) {
    console.error('Callback error:', err);
    return NextResponse.redirect(`${new URL(request.url).origin}/qa/en/login?error=server_error`);
  }
}