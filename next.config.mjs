/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
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
};

export default nextConfig;
