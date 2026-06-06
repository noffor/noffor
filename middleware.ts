// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (pathname.match(/\.(svg|png|jpg|jpeg|webp|avif|ico|css|js|woff2|json|map)$/)) {
    return NextResponse.next();
  }
  
  const publicRoutes = ['/login', '/register', '/auth/', '/api/', '/_next'];
  if (publicRoutes.some(r => pathname.includes(r))) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true },
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  
  const segments = pathname.split('/').filter(Boolean);
  const country = segments[0] || 'qa';
  const lang = segments[1] || 'en';

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/qa/en', request.url));
  }

  const protectedRoutes = ['/create', '/tracking', '/bid', '/dashboard', '/settings', '/messages'];
  const needsAuth = protectedRoutes.some(r => pathname.includes(r));

  if (needsAuth && !session) {
    const loginUrl = new URL(`/${country}/${lang}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};