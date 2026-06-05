// app/auth/callback/route.ts - Vercel Login Fixed (Simple)
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const next = searchParams.get('next') || 'dashboard';
    const country = searchParams.get('country') || 'qa';
    const lang = searchParams.get('lang') || 'en';
    const role = searchParams.get('role') || 'labor';

    if (error) {
      return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=${error}`);
    }

    if (!code) {
      return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=no_code`);
    }

    const cookieStore = await cookies();
    
    // ✅ Simple - NO custom domain options
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
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
      return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=exchange`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=no_user`);
    }

    // Profile upsert
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

    const dashboardPath = role === 'employer' ? 'dashboard/employer' : 'dashboard';
    return NextResponse.redirect(`${origin}/${country}/${lang}/${dashboardPath}`);

  } catch (err: any) {
    return NextResponse.redirect(`${new URL(request.url).origin}/qa/en/login?error=server`);
  }
}