/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
  sassOptions: {
    // Use the modern Sass API to fix the deprecation warning
    api: "modern",
  },
};

export default nextConfig;
