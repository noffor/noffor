// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const country = searchParams.get('country') || 'qa';
  const lang = searchParams.get('lang') || 'en';

  if (!code) return NextResponse.redirect(`${origin}/${country}/${lang}/login?error=no_code`);

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (key) => cookieStore.get(key)?.value, set: () => {}, remove: () => {} } }
  );
  
  await supabase.auth.exchangeCodeForSession(code);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
    
    if (!existing) {
      await supabase.from('profiles').insert({
        id: user.id,
        name: user.user_metadata?.full_name || 'User',
        email: user.email,
        photo_url: user.user_metadata?.avatar_url || '',
        role: 'labor', country,
        is_online: false, is_verified: true,
        created_at: new Date().toISOString()
      });
    }
  }

  return NextResponse.redirect(`${origin}/${country}/${lang}/dashboard`);
}