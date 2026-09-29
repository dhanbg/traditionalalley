export default function manifest() {
  return {
    name: 'Traditional Alley - Authentic Nepali Fashion & Traditional Clothing',
    short_name: 'Traditional Alley',
    description: 'Discover authentic Nepali traditional clothing, ethnic wear, bridal lehengas, and contemporary fashion at Traditional Alley.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/favicon.ico?v=2',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/apple-touch-icon.png?v=2',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon-192.png?v=2',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png?v=2',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
