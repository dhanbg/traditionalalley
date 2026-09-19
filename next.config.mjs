/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'motion',
      'framer-motion',
      '@radix-ui/react-slot',
      'swiper',
      'axios',
      'zustand',
      'clsx',
      'tailwind-merge',
      '@tanstack/react-query',
    ],
  },
  images: {
    // Disabled on-demand optimization on Vercel to prevent exceeding free tier transformation (5K/mo) and CPU limits.
    // Images are served directly without serverless transformation overhead.
    unoptimized: true,
    formats: ['image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
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
      {
        protocol: 'https',
        hostname: '*.ucarecdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.image2url.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image2url.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '82.25.105.70',
        port: '1339',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets-api.kathmandupost.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thebuzznepal.com',
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
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
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
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/logo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:path*.:ext(svg|png|jpg|jpeg|webp|avif|mp3|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/404',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:path(home-.*)',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
