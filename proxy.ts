// proxy.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Static + Auth callback skip
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/auth/') ||
    pathname.match(/\.(svg|png|jpg|jpeg|webp|avif|ico|css|js|woff2|json|map)$/)
  ) {
    return NextResponse.next();
  }
  
  // Public routes
  if (
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/privacy') ||
    pathname.includes('/help') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const country = segments[0] || 'qa';
  const lang = segments[1] || 'en';

  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(new URL('/qa/en', request.url));
  }

  const protectedPaths = ['/create', '/tracking', '/bid', '/dashboard', '/settings', '/messages'];
  const isProtected = protectedPaths.some(p => pathname.includes(p));

  if (isProtected) {
    try {
      let response = NextResponse.next({ request });
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
      if (!session) {
        const loginUrl = new URL(`/${country}/${lang}/login`, request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return response;
    } catch (err) {
      return NextResponse.redirect(new URL(`/${country}/${lang}/login`, request.url));
    }
  }

  return NextResponse.next();
}