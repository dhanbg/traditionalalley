/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // ✅ PERFORMANCE: Enable image optimization for WebP conversion and responsive sizing
    unoptimized: true, 
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'admin.traditionalalley.com.np',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'admin-staging.traditionalalley.com.np',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.ucarecd.net',
        port: '',
        pathname: '/**',
      },
      // Dynamic hostname based on NEXT_PUBLIC_API_URL
      ...(process.env.NEXT_PUBLIC_API_URL ? [{
        protocol: process.env.NEXT_PUBLIC_API_URL.startsWith('https') ? 'https' : 'http',
        hostname: new URL(process.env.NEXT_PUBLIC_API_URL).hostname,
        port: new URL(process.env.NEXT_PUBLIC_API_URL).port || '',
        pathname: '/**',
      }] : []),
    ],
  },
  sassOptions: {
    // Use the modern Sass API to fix the deprecation warning
    api: "modern",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/css/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/logo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
