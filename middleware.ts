// middleware.ts - Cache headers যোগ
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // ✅ Cache static assets for 1 year
  if (pathname.match(/\.(svg|png|jpg|jpeg|webp|avif|ico|css|js|woff2)$/)) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }
  
  // ✅ Skip auth callback
  if (pathname.startsWith('/auth/')) return NextResponse.next();
  
  // Skip static files
  if (pathname.includes('.')) return NextResponse.next();
  
  // Already has country/lang
  const match = pathname.match(/^\/([a-z]{2})\/([a-z]{2})/);
  if (match) return NextResponse.next();
  
  // Default redirect to Qatar/EN
  const defaultCountry = 'qa';
  const defaultLang = 'en';
  
  return NextResponse.redirect(new URL(`/${defaultCountry}/${defaultLang}${pathname}`, request.url));
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};