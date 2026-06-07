// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
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
          flowType: 'implicit',
          autoRefreshToken: true,
          persistSession: true,
        },
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                path: '/',
                secure: true,
                sameSite: 'lax' as const,
                maxAge: 60 * 60 * 24 * 30,
              });
            });
          },
        },
      }
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=exchange`);
    }

    const user = data?.user || data?.session?.user;

    if (user) {
      try {
        const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
        if (!existing) {
          await supabase.from('profiles').upsert({
            id: user.id,
            name: user.user_metadata?.full_name || 'User',
            email: user.email || '',
            photo_url: user.user_metadata?.avatar_url || '',
            role, country, profile_language: lang,
            is_online: false, is_verified: true,
            rating: 0, total_reviews: 0,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          }, { onConflict: 'id' });
        } else {
          await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', user.id);
        }
      } catch (e) {}
    }

    const dashboardPath = role === 'employer' ? 'dashboard/employer' : 'dashboard';
    const response = NextResponse.redirect(`${origin}/${country}/${lang}/${dashboardPath}`);
    response.headers.set('Cache-Control', 'no-store');
    return response;

  } catch (err: any) {
    return NextResponse.redirect(`${new URL(request.url).origin}/qa/en/login?error=server`);
  }
}