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
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
