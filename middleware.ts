// middleware.ts - Root-এই তৈরি করুন
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  console.log('🛡️ MW:', pathname);
  
  // Static files - skip
  if (pathname.match(/\.(svg|png|jpg|jpeg|webp|avif|ico|css|js|woff2|json|map)$/)) {
    return NextResponse.next();
  }
  
  // Public routes - skip
  const publicRoutes = ['/login', '/register', '/auth/', '/api/', '/_next', '/favicon.ico'];
  if (publicRoutes.some(r => pathname.includes(r))) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const country = segments[0] || 'qa';
  const lang = segments[1] || 'en';

  // Protected routes
  const protectedRoutes = ['/create', '/tracking', '/bid', '/dashboard', '/profile', '/settings', '/messages', '/notifications', '/my-jobs', '/my-workers'];
  const needsAuth = protectedRoutes.some(r => pathname.includes(r));
  const isAdminRoute = pathname.includes('/admin') && !pathname.includes('/admin/login');

  // Root redirect
  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(new URL('/qa/en', request.url));
  }

  if (needsAuth || isAdminRoute) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                request.cookies.set({
                  name,
                  value,
                  ...options,
                });
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

      if (isAdminRoute) {
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        if (!profile || profile.role !== 'admin') {
          return NextResponse.redirect(new URL(`/${country}/${lang}`, request.url));
        }
      }

      const response = NextResponse.next();
      response.headers.set('X-Auth-User-Id', session.user.id);
      return response;
      
    } catch (err: any) {
      console.error('MW Error:', err.message);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};