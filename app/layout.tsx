// app/layout.tsx - PWA Ready
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata = {
  title: 'Noffor - Find Workers & Jobs in Gulf',
  description: 'Find skilled workers and job opportunities across Qatar, UAE, Saudi, Kuwait, Bahrain, Oman',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* ✅ DNS Prefetch */}
        <link rel="dns-prefetch" href="https://pbytmyjsxbczhhbjlkea.supabase.co" />
        <link rel="preconnect" href="https://pbytmyjsxbczhhbjlkea.supabase.co" crossOrigin="anonymous" />
        
        {/* ✅ PWA Meta Tags */}
        <meta name="application-name" content="Noffor" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Noffor" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#f97316" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        
        {/* ✅ Service Worker */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}