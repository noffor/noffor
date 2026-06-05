// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  
  // ✅ Production compression
  compress: true,
  poweredByHeader: false,
  
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? true : false,
  },
  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js', '@supabase/ssr'],
  },
  
  // ✅ Cache headers
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|woff2|css|js)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
  
  async redirects() {
    return [
      { source: '/', destination: '/qa/en', permanent: true }
    ]
  },
  
  allowedDevOrigins: ['192.168.8.107', '10.114.18.225', 'localhost'],
};

export default nextConfig;