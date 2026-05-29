import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async redirects() {
    return [
      { source: '/', destination: '/qa/en', permanent: true }
    ]
  },
  allowedDevOrigins: ['192.168.8.107', '10.114.18.225', 'localhost'],
};

export default nextConfig;