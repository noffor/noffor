// proxy.ts - Login Loop Fixed • Next.js 16 Ready
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // ═══════════════════════════════════════════════════════
  // Static files - bypass
  // ═══════════════════════════════════════════════════════
  if (pathname.match(/\.(svg|png|jpg|jpeg|webp|avif|ico|css|js|woff2|json)$/)) {
    return NextResponse.next();
  }
  
  // ═══════════════════════════════════════════════════════
  // Public routes - bypass (NO session check)
  // ═══════════════════════════════════════════════════════
  const publicRoutes = ['/login', '/register', '/auth/', '/api/', '/dashboard'];
  const isPublicRoute = publicRoutes.some(route => pathname.includes(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ═══════════════════════════════════════════════════════
  // Extract country/lang from URL
  // ═══════════════════════════════════════════════════════
  const segments = pathname.split('/').filter(Boolean);
  const country = segments[0] || 'qa';
  const lang = segments[1] || 'en';

  // ═══════════════════════════════════════════════════════
  // Protected routes (need login) - Dashboard removed!
  // ═══════════════════════════════════════════════════════
  const protectedRoutes = ['/create', '/tracking', '/bid'];
  const needsAuth = protectedRoutes.some(route => pathname.includes(route));
  
  // Admin routes
  const isAdminRoute = pathname.includes('/admin') && !pathname.includes('/admin/login');

  // ═══════════════════════════════════════════════════════
  // Only check session for protected routes
  // ═══════════════════════════════════════════════════════
  if (needsAuth || isAdminRoute) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (cookiesToSet) => {
              cookiesToSet.forEach(({ name, value }) => {
                request.cookies.set(name, value);
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
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!profile || profile.role !== 'admin') {
          return NextResponse.redirect(new URL(`/${country}/${lang}`, request.url));
        }
      }

      return NextResponse.next();
      
    } catch (err) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};