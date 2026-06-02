// next.config.ts - Bundle + CSS optimize
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // ✅ Production optimize
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
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