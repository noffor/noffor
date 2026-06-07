// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // ⚠️ CRITICAL: Static files skip
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(svg|png|jpg|jpeg|webp|avif|ico|css|js|woff2|json|map)$/)
  ) {
    return NextResponse.next();
  }
  
  // ⚠️ CRITICAL: Auth callback skip করতেই হবে!
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }
  
  // ⚠️ CRITICAL: Public routes skip
  if (
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  // ✅ Session check for protected routes
  const segments = pathname.split('/').filter(Boolean);
  const country = segments[0] || 'qa';
  const lang = segments[1] || 'en';

  // Root redirect
  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(new URL('/qa/en', request.url));
  }

  // Protected routes
  const protectedPaths = ['/create', '/tracking', '/bid', '/dashboard', '/settings', '/messages'];
  const isProtected = protectedPaths.some(p => pathname.includes(p));

  if (isProtected) {
    try {
      let response = NextResponse.next({ request });
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
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
      console.error('Middleware error:', err);
      const loginUrl = new URL(`/${country}/${lang}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};