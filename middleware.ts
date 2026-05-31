// middleware.ts (root-এ)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
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