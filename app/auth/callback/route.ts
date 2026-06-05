// app/auth/callback/route.ts - HARDCODE ANON KEY
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ✅ TEMPORARY HARDCODE
const SUPABASE_URL = 'https://pbytmyjsxbczhhbjlkea.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieXRteWpzeGJjemhoYmpsa2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MTM4MjUsImV4cCI6MjA5NTE4OTgyNX0.8FRW5zmFM6ur4nVLaSCMIllF23Xa74mRGh4c878TmDE';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
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
    
    // ✅ HARDCODED KEY
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    });

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error('EXCHANGE ERROR:', exchangeError.message);
      return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=exchange`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=no_user`);
    }

    // Profile
    const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
    if (!existing) {
      await supabase.from('profiles').upsert({
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role: role, country, profile_language: lang,
        is_online: false, is_verified: true, rating: 0, total_reviews: 0,
        created_at: new Date().toISOString(), last_login: new Date().toISOString(),
      }, { onConflict: 'id' });
    }

    const dashboardPath = role === 'employer' ? 'dashboard/employer' : 'dashboard';
    return NextResponse.redirect(`${origin}/${country}/${lang}/${dashboardPath}`);

  } catch (err: any) {
    return NextResponse.redirect(`${new URL(request.url).origin}/qa/en/login?error=server`);
  }
}